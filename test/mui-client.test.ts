// @vitest-environment jsdom
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import * as mui9 from '@mui/material';
import * as mui7 from '@mui/material-v7';
import { act, createElement as h, createRef, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { colors, component, radius, typography } from '../dist/esm/index.js';
import { muiThemeOptions } from '../dist/esm/mui.js';
import { declarations } from './helpers';

// 브라우저처럼 그려야 보이는 것을 jsdom 에서 본다.
// 1) 물결(TouchRipple)은 서버 렌더에 처음부터 없고, 누를 때 붙는다. 그래서 mousedown 을 보낸다.
//    기본 테마에서는 물결이 생겨야 이 검사가 뜻이 있다(대조군).
// 2) Tooltip 은 마운트 뒤에 앵커를 잡아야 열린다.
// 3) 키보드 초점(Mui-focusVisible)은 마운트 뒤에 붙는다. ButtonBase 의 action.focusVisible() 로 붙인다.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Mui = any;

const versions: Array<[label: string, mui: Mui]> = [
  ['MUI 9', mui9],
  ['MUI 7', mui7],
];

const flags = globalThis as Record<string, unknown>;
let previousActEnvironment: unknown;
beforeAll(() => {
  previousActEnvironment = flags.IS_REACT_ACT_ENVIRONMENT;
  flags.IS_REACT_ACT_ENVIRONMENT = true;
});
afterAll(() => {
  flags.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
});

/** 그린 뒤 act 를 돌리고, 정리 함수를 돌려준다. */
async function mount(mui: Mui, theme: unknown, children: ReactNode) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const cache = createCache({ key: 'sr' });
  await act(async () => {
    root.render(h(CacheProvider, { value: cache }, h(mui.ThemeProvider, { theme }, children)));
  });
  const unmount = async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  };
  return { container, unmount };
}

async function rippleAfterPress(mui: Mui, theme: unknown): Promise<boolean> {
  const { container, unmount } = await mount(mui, theme, h(mui.Button, { variant: 'contained' }, '저장'));
  const button = container.querySelector('button');
  if (!button) throw new Error('button not rendered');
  await act(async () => {
    button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 4, clientY: 4 }));
  });
  const found = container.querySelector('.MuiTouchRipple-root') !== null;
  await unmount();
  return found;
}

/** 문서에 들어간 emotion 스타일에서 요소의 기본 규칙을 읽는다. suffix 를 주면 `.sr-xxx${suffix}` 규칙을 읽는다. */
function elementStyle(element: Element, suffix = ''): Map<string, string> {
  const name = [...element.classList].find((c) => c.startsWith('sr-'));
  if (!name) throw new Error(`no sr- class on ${element.className}`);
  const css = [...document.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n');
  return declarations(css, `.${name}${suffix}`);
}

describe.each(versions)('%s (jsdom)', (_label, mui) => {
  it('기본 테마는 누르면 TouchRipple 이 생긴다(대조군)', async () => {
    expect(await rippleAfterPress(mui, mui.createTheme())).toBe(true);
  });

  it('muiThemeOptions 테마는 눌러도 TouchRipple 이 없다', async () => {
    expect(await rippleAfterPress(mui, mui.createTheme(muiThemeOptions))).toBe(false);
  });

  it('Tooltip: inverse 면, 흰 글자 13/18, 여백 8 12, 모서리 8, keep-all, 최대 폭', async () => {
    const { container, unmount } = await mount(
      mui,
      mui.createTheme(muiThemeOptions),
      h(
        mui.Tooltip,
        { open: true, title: '전체 재학생 명단을 올려 주세요.', slotProps: { popper: { disablePortal: true } } },
        h('button', { type: 'button' }, 'i'),
      ),
    );
    const tip = container.querySelector('.MuiTooltip-tooltip');
    expect(tip).not.toBeNull();
    const style = elementStyle(tip as Element);
    expect(style.get('background-color')).toBe(colors.surface.inverse);
    expect(style.get('color')).toBe(colors.inverse.text.primary);
    expect(style.get('font-size')).toBe(typography.levels.meta.fontSize);
    expect(style.get('line-height')).toBe(typography.levels.meta.lineHeight);
    expect(style.get('font-weight')).toBe('400');
    expect(style.get('padding')).toBe(`${component.tooltip.paddingY} ${component.tooltip.paddingX}`);
    expect(style.get('border-radius')).toBe(radius.control);
    expect(style.get('word-break')).toBe('keep-all');
    expect(style.get('max-width')).toBe(component.tooltip.maxWidth);
    await unmount();
  });

  // Grow 는 열릴 때 요소의 style.transition 에 길이를 적는다. 기본 테마는 툴팁 200ms, 토스트 225ms 다(대조군).
  async function openTransition(theme: unknown, part: 'tooltip' | 'toast'): Promise<string> {
    const children =
      part === 'tooltip'
        ? h(
            mui.Tooltip,
            { open: true, title: '설명', slotProps: { popper: { disablePortal: true } } },
            h('button', { type: 'button' }, 'i'),
          )
        : h(mui.Snackbar, { open: true, message: '저장했습니다' });
    const { container, unmount } = await mount(mui, theme, children);
    const selector = part === 'tooltip' ? '.MuiTooltip-tooltip' : '.MuiSnackbarContent-root';
    const transition = (container.querySelector(selector) as HTMLElement | null)?.style.transition ?? '';
    await unmount();
    return transition;
  }

  it('툴팁과 토스트는 커지는 움직임 없이 바로 나타난다', async () => {
    for (const part of ['tooltip', 'toast'] as const) {
      expect(await openTransition(mui.createTheme(), part), `${part} 대조군`).toMatch(/opacity [1-9]\d*ms/);
      expect(await openTransition(mui.createTheme(muiThemeOptions), part), part).toMatch(/^opacity 0ms/);
    }
  });

  it('메뉴와 팝오버는 열림 길이가 0 이다', () => {
    const { components } = mui.createTheme(muiThemeOptions);
    expect(components.MuiMenu.defaultProps.transitionDuration).toBe(0);
    expect(components.MuiPopover.defaultProps.transitionDuration).toBe(0);
  });

  it('키보드 초점을 받은 탭은 남색 테두리를 탭 안쪽에 긋는다(탭 줄의 overflow 에 잘리지 않는다)', async () => {
    const action = createRef<{ focusVisible: () => void }>();
    const { container, unmount } = await mount(
      mui,
      mui.createTheme(muiThemeOptions),
      h(mui.Tabs, { value: 0 }, h(mui.Tab, { label: '재학생', action }), h(mui.Tab, { label: '만료' })),
    );
    await act(async () => {
      action.current?.focusVisible();
    });
    const tab = container.querySelector('.MuiTab-root');
    expect(tab?.classList.contains('Mui-focusVisible')).toBe(true);
    const focus = elementStyle(tab as Element, '.Mui-focusVisible');
    expect(focus.get('outline')).toBe(`${component.focusRing.width} solid ${colors.brand.main}`);
    expect(focus.get('outline-offset')).toBe(`calc(-1 * ${component.focusRing.width})`);
    await unmount();
  });
});
