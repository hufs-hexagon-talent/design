import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import * as mui9 from '@mui/material';
import * as mui7 from '@mui/material-v7';
import { createElement as h, type ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { colors, component, height, radius, shadow, typography } from '../dist/esm/index.js';
import { muiThemeOptions } from '../dist/esm/mui.js';
import {
  baseStyle,
  declarations,
  emotionClass,
  lastValue,
  requireSelf,
  rulesContaining,
  squash,
  styleText,
} from './helpers';

// 두 버전의 모듈 모양은 같다. 타입은 버전마다 달라서 여기서는 묶어 다룬다.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Mui = any;

const versions: Array<[label: string, mui: Mui, pkg: string, major: number]> = [
  ['MUI 9', mui9, '@mui/material/package.json', 9],
  ['MUI 7', mui7, '@mui/material-v7/package.json', 7],
];

const { levels } = typography;
const white = colors.inverse.text.primary;

/** ThemeProvider 와 새 emotion 캐시(key sr) 안에서 서버 렌더한다. 캐시를 새로 만들어 스타일이 매번 HTML 에 실린다. */
function render(mui: Mui, children: (m: Mui) => ReactNode, theme = mui.createTheme(muiThemeOptions)): string {
  const cache = createCache({ key: 'sr' });
  return renderToString(h(CacheProvider, { value: cache }, h(mui.ThemeProvider, { theme }, children(mui))));
}

const sample = (m: Mui) => [
  h(m.Button, { key: 'b', variant: 'contained' }, '저장'),
  h(m.Typography, { key: 't', variant: 'title' }, '회원'),
  h(
    m.Dialog,
    { key: 'd', open: true, disablePortal: true },
    h(m.DialogTitle, null, '명단 반영'),
    h(m.DialogContent, null, h(m.DialogContentText, null, '되돌릴 수 없습니다.')),
    h(
      m.DialogActions,
      null,
      h(m.Button, { variant: 'outlined' }, '취소'),
      h(m.Button, { variant: 'contained', color: 'error' }, '반영'),
    ),
  ),
];

describe.each(versions)('%s', (_label, mui, pkg, major) => {
  it(`설치된 버전이 ${major} 이다`, () => {
    const { version } = requireSelf(pkg) as { version: string };
    expect(Number(version.split('.')[0])).toBe(major);
  });

  it('createTheme(muiThemeOptions) 가 palette, typography, shape 를 만든다', () => {
    const theme = mui.createTheme(muiThemeOptions);
    const { palette } = theme;
    expect(palette.primary).toMatchObject({
      main: colors.brand.main,
      dark: colors.brand.hover,
      light: colors.brand.subtle,
      contrastText: white,
    });
    expect(palette.error.main).toBe(colors.status.danger);
    expect(palette.success.main).toBe(colors.status.success);
    expect(palette.warning.main).toBe(colors.status.warning);
    expect(palette.text).toMatchObject({ ...colors.text });
    expect(palette.background).toMatchObject({ default: colors.surface.page, paper: colors.surface.card });
    expect(palette.divider).toBe(colors.border.default);
    expect(palette.brand).toEqual({ ...colors.brand });
    expect(palette.surface).toEqual({ ...colors.surface });
    expect(palette.border).toEqual({ ...colors.border });
    expect(palette.inverse).toEqual({ text: { ...colors.inverse.text } });

    for (const name of Object.keys(levels) as Array<keyof typeof levels>) {
      expect(theme.typography[name]).toMatchObject({ ...levels[name], fontFamily: typography.fontFamily });
    }
    expect(theme.typography.button).toMatchObject({
      fontSize: levels.control.fontSize,
      lineHeight: levels.control.lineHeight,
      fontWeight: typography.buttonWeight,
      textTransform: 'none',
    });
    expect(theme.shape.borderRadius).toBe(8);
  });

  it('spacing 과 breakpoint, MUI 기본 variant 는 바꾸지 않는다', () => {
    const theme = mui.createTheme(muiThemeOptions);
    const plain = mui.createTheme();
    expect(theme.spacing(1)).toBe('8px');
    expect(theme.breakpoints.values).toEqual(plain.breakpoints.values);
    expect(theme.breakpoints.values.md).toBe(900);
    const builtIn = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2', 'caption', 'overline'];
    for (const variant of builtIn) {
      const { fontSize, lineHeight, fontWeight } = plain.typography[variant];
      expect(theme.typography[variant], variant).toMatchObject({ fontSize, lineHeight, fontWeight });
    }
  });

  it('createTheme 이 muiThemeOptions 를 바꾸지 않는다', () => {
    const before = JSON.stringify(muiThemeOptions);
    mui.createTheme(muiThemeOptions);
    mui.createTheme(muiThemeOptions);
    expect(JSON.stringify(muiThemeOptions)).toBe(before);
  });

  describe('서버 렌더: Button, Typography title, 열린 Dialog', () => {
    const html = render(mui, sample);
    const css = styleText(html);

    it('누를 때 물결(TouchRipple)이 없다', () => {
      expect(html).not.toContain('MuiTouchRipple');
    });

    it('주 버튼: 높이 36, 모서리 8, 남색 면, 그림자 없음, 14/20 600', () => {
      const style = baseStyle(html, ['MuiButton-contained', 'MuiButton-colorPrimary']);
      expect(style.get('height')).toBe(height.button);
      expect(style.get('border-radius')).toBe(radius.control);
      expect(style.get('background-color')).toBe(colors.brand.main);
      expect(style.get('color')).toBe(white);
      expect(style.get('box-shadow')).toBe('none');
      expect(style.get('font-size')).toBe(levels.control.fontSize);
      expect(style.get('line-height')).toBe(levels.control.lineHeight);
      expect(style.get('font-weight')).toBe(String(typography.buttonWeight));
      expect(style.get('text-transform')).toBe('none');
      expect(style.get('padding')).toBe(`0 ${component.button.paddingX}`);
      const cls = emotionClass(html, ['MuiButton-contained', 'MuiButton-colorPrimary']);
      expect(declarations(css, `.${cls}:hover`).get('background-color')).toBe(colors.brand.hover);
      expect(declarations(css, `.${cls}.Mui-disabled`).get('background-color')).toBe(colors.surface.disabled);
    });

    it('Typography title: h1, 22/30 700', () => {
      expect(html).toMatch(/<h1 class="[^"]*MuiTypography-title/);
      const style = baseStyle(html, 'MuiTypography-title');
      expect(style.get('font-size')).toBe('22px');
      expect(style.get('line-height')).toBe('30px');
      expect(style.get('font-weight')).toBe('700');
      expect(style.get('letter-spacing')).toBe('-0.02em');
      expect(style.get('color')).toBe(colors.text.primary);
    });

    it('Dialog: 판 모서리 14, overlay 그림자, 가림막 색', () => {
      const paper = baseStyle(html, 'MuiDialog-paper');
      expect(paper.get('border-radius')).toBe(radius.card);
      expect(squash(paper.get('box-shadow'))).toBe(squash(shadow.overlay));
      expect(baseStyle(html, 'MuiBackdrop-root').get('background-color')).toBe(colors.overlay);
    });

    it('Dialog: 판의 폭은 테마가 정하지 않는다(Dialog 부품이 정한다)', () => {
      const paper = baseStyle(html, 'MuiDialog-paper');
      expect(paper.get('width')).toBeUndefined();
      expect(paper.get('max-width')).not.toBe(component.dialog.width);
    });

    it('Dialog 제목 17/24 700, 한 줄 15/22 secondary, 버튼 줄 gap 8·여백 24, 선 없음', () => {
      const title = baseStyle(html, 'MuiDialogTitle-root');
      expect(title.get('font-size')).toBe(levels.heading.fontSize);
      expect(title.get('line-height')).toBe(levels.heading.lineHeight);
      expect(title.get('font-weight')).toBe('700');
      expect(title.get('padding')).toBe('24px 24px 0');
      const content = baseStyle(html, 'MuiDialogContent-root');
      expect(content.get('padding')).toBe('24px 24px 0');
      expect(content.get('border-top')).toBeUndefined();
      const contentCls = emotionClass(html, 'MuiDialogContent-root');
      const afterTitle = rulesContaining(css, `.MuiDialogTitle-root+.${contentCls}`).at(-1);
      expect(afterTitle?.decls.get('padding-top')).toBe(component.dialog.textGap);
      const text = baseStyle(html, 'MuiDialogContentText-root');
      expect(text.get('font-size')).toBe(levels.body.fontSize);
      expect(text.get('line-height')).toBe(levels.body.lineHeight);
      expect(text.get('color')).toBe(colors.text.secondary);
      const actions = baseStyle(html, 'MuiDialogActions-root');
      expect(actions.get('padding')).toBe(component.dialog.padding);
      expect(actions.get('gap')).toBe('8px');
      expect(actions.get('border-top')).toBeUndefined();
    });

    it('판의 취소는 .btn.secondary, 조작은 .btn.danger 모양이다', () => {
      const cancel = baseStyle(html, ['MuiButton-outlined', 'MuiButton-colorPrimary']);
      expect(cancel.get('background-color')).toBe(colors.surface.card);
      expect(cancel.get('color')).toBe(colors.text.body);
      expect(cancel.get('border')).toBe(`1px solid ${colors.border.control}`);
      const danger = baseStyle(html, ['MuiButton-contained', 'MuiButton-colorError']);
      expect(danger.get('background-color')).toBe(colors.status.danger);
      expect(danger.get('color')).toBe(white);
      expect(danger.get('height')).toBe(height.button);
    });
  });

  it('버튼 다섯 모양과 크기, 꺼진 모양', () => {
    const html = render(mui, (m) => [
      h(m.Button, { key: 1, variant: 'text' }, '닫기'),
      h(m.Button, { key: 2, variant: 'link' }, '전체 보기'),
      h(m.Button, { key: 3, variant: 'contained', size: 'small' }, '저장'),
      h(m.Button, { key: 4, variant: 'contained', size: 'large' }, '예약하기'),
      h(m.Button, { key: 5, variant: 'outlined', disabled: true }, '취소'),
      h(m.Button, { key: 6, variant: 'contained', color: 'error', loading: true, loadingPosition: 'start' }, '반영 중'),
    ]);
    const css = styleText(html);

    const ghost = baseStyle(html, ['MuiButton-text', 'MuiButton-colorPrimary']);
    expect(ghost.get('color')).toBe(colors.text.secondary);
    expect(ghost.get('font-weight')).toBe('500');
    expect(ghost.get('padding')).toBe(`0 ${component.button.paddingXGhost}`);
    const ghostCls = emotionClass(html, ['MuiButton-text', 'MuiButton-colorPrimary']);
    expect(declarations(css, `.${ghostCls}:hover`).get('background-color')).toBe(colors.surface.subtle);

    const link = baseStyle(html, 'MuiButton-link');
    expect(link.get('height')).toBe('auto');
    expect(link.get('padding')).toBe('0');
    expect(link.get('font-size')).toBe(levels.meta.fontSize);
    expect(link.get('color')).toBe(colors.text.tertiary);
    const linkCls = emotionClass(html, 'MuiButton-link');
    const linkHover = declarations(css, `.${linkCls}:hover`);
    expect(linkHover.get('color')).toBe(colors.brand.main);
    expect(linkHover.get('text-decoration')).toBe('underline');

    const small = baseStyle(html, 'MuiButton-sizeSmall');
    expect(small.get('height')).toBe(height.buttonSmall);
    expect(small.get('font-size')).toBe(levels.meta.fontSize);

    const large = baseStyle(html, 'MuiButton-sizeLarge');
    expect(large.get('height')).toBe(height.buttonTouch);

    const offCls = emotionClass(html, ['MuiButton-outlined', 'MuiButton-colorPrimary']);
    const off = declarations(css, `.${offCls}.Mui-disabled`);
    expect(off.get('background-color')).toBe(colors.surface.card);
    expect(off.get('color')).toBe(colors.text.disabled);
    expect(off.get('border-color')).toBe(colors.border.default);

    // 진행 중(loading)에도 위험 면과 흰 글자를 둔다.
    const pendingCls = emotionClass(html, 'MuiButton-loading');
    expect(declarations(css, `.${pendingCls}.MuiButton-loading`).get('background-color')).toBe(colors.status.danger);
    const pendingText = rulesContaining(css, `.${pendingCls}.MuiButton-loadingPositionStart`).at(-1);
    expect(pendingText?.decls.get('color')).toBe(white);
  });

  // Tooltip 은 서버 렌더에서 열리지 않는다(MUI 가 앵커를 마운트 뒤에 잡는다). mui-client.test.ts 에서 본다.
  it('나머지 부품도 두 버전에서 오류 없이 그린다', () => {
    const html = render(mui, (m) => [
      h(m.CssBaseline, { key: 'base' }),
      h(m.IconButton, { key: 'icon', 'aria-label': '닫기' }, h('svg', { className: 'MuiSvgIcon-root' })),
      h(m.Link, { key: 'link', href: '#' }, '이용 안내'),
      h(m.CircularProgress, { key: 'ring' }),
      h(m.TextField, {
        key: 'search',
        placeholder: '이름 또는 학번',
        slotProps: { input: { startAdornment: h(m.InputAdornment, { position: 'start' }, '?') } },
      }),
      h(m.TextField, { key: 'multi', multiline: true, minRows: 2 }),
      h(m.TextField, { key: 'labelled', label: '호실' }),
      h(
        m.Tabs,
        { key: 'tabs', value: 0 },
        h(m.Tab, { label: '재학생' }),
        h(m.Tab, { label: '만료' }),
      ),
      h(
        m.Table,
        { key: 'table', stickyHeader: true },
        h(m.TableHead, null, h(m.TableRow, null, h(m.TableCell, null, '이름'))),
        h(m.TableBody, null, h(m.TableRow, { hover: true }, h(m.TableCell, null, '학생'))),
      ),
      h(
        m.Popover,
        {
          key: 'pop',
          open: true,
          disablePortal: true,
          anchorReference: 'anchorPosition',
          anchorPosition: { top: 0, left: 0 },
        },
        '메뉴',
      ),
    ]);
    const css = styleText(html);

    const body = declarations(css, 'body');
    expect(body.get('background-color')).toBe(colors.surface.page);
    expect(body.get('color')).toBe(colors.text.body);
    expect(body.get('word-break')).toBe('keep-all');
    expect(squash(body.get('font-family'))).toBe(squash(typography.fontFamily));

    // 아이콘 버튼은 최소 32 이고 폭과 높이를 고정하지 않는다. 그래서 앱이 sx 로 준 안쪽 여백만큼 커진다.
    const icon = baseStyle(html, 'MuiIconButton-root');
    expect(icon.get('min-width')).toBe(component.iconButton.size);
    expect(icon.get('min-height')).toBe(component.iconButton.size);
    expect(icon.has('width')).toBe(false);
    expect(icon.has('height')).toBe(false);
    expect(icon.get('padding')).toBe('0');
    expect(icon.get('border-radius')).toBe(radius.control);
    expect(icon.get('color')).toBe(colors.text.secondary);

    // 문장 속 링크: 둘레의 글자 단계를 따르고, 주 색에 밑줄을 늘 둔다.
    const link = baseStyle(html, 'MuiLink-root');
    expect(link.get('color')).toBe(colors.brand.main);
    expect(link.get('text-decoration')).toBe('underline');
    expect(link.get('text-decoration-color')).toBe('currentColor');
    expect(link.has('font-size')).toBe(false);
    expect(html).not.toMatch(/class="[^"]*MuiTypography-meta[^"]*MuiLink-root/);

    expect(baseStyle(html, 'MuiCircularProgress-root').get('color')).toBe(colors.brand.main);

    const field = baseStyle(html, 'MuiInputBase-adornedStart');
    expect(field.get('height')).toBe(height.input);
    expect(field.get('border-radius')).toBe(radius.control);
    expect(field.get('padding-left')).toBe(component.input.paddingX);
    const fieldCls = emotionClass(html, 'MuiInputBase-adornedStart');
    expect(declarations(css, `.${fieldCls} .MuiOutlinedInput-notchedOutline`).get('border-color')).toBe(
      colors.border.control,
    );
    expect(
      rulesContaining(css, `.${fieldCls}.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline`).at(-1)
        ?.decls.get('border-color'),
    ).toBe(colors.brand.main);
    const multi = baseStyle(html, 'MuiInputBase-multiline');
    expect(multi.get('height')).toBeUndefined();
    // 라벨이 있는 TextField 도 기본 크기가 small 이라 라벨 자리가 높이 40 에 맞는다.
    expect(html).toMatch(/class="[^"]*MuiInputLabel-sizeSmall[^"]*"[^>]*>호실/);
    expect(baseStyle(html, ['MuiInputBase-root', 'MuiInputBase-sizeSmall']).get('height')).toBe(height.input);

    expect(baseStyle(html, 'MuiTabs-root').get('min-height')).toBe(height.tab);
    const tab = baseStyle(html, 'MuiTab-root');
    expect(tab.get('height')).toBe(height.tab);
    expect(tab.get('text-transform')).toBe('none');
    expect(tab.get('font-size')).toBe(levels.control.fontSize);
    const indicatorCls = emotionClass(html, 'MuiTabs-indicator');
    expect(declarations(css, `.${indicatorCls}::after`).get('background-color')).toBe(colors.brand.main);
    // 밑줄은 탭 사이를 미끄러지지 않는다.
    expect(baseStyle(html, 'MuiTabs-indicator').get('transition')).toBe('none');

    const head = baseStyle(html, 'MuiTableCell-head');
    expect(head.get('font-size')).toBe(levels.label.fontSize);
    expect(head.get('font-weight')).toBe('600');
    expect(head.get('color')).toBe(colors.text.tertiary);
    expect(head.get('background-color')).toBe(colors.surface.card);
    const cell = baseStyle(html, 'MuiTableCell-body');
    expect(cell.get('height')).toBe(height.row);
    expect(cell.get('border-top')).toBe(`1px solid ${colors.border.subtle}`);
    expect(cell.get('font-size')).toBe(levels.body.fontSize);

    const popover = baseStyle(html, 'MuiPopover-paper');
    expect(popover.get('border-radius')).toBe(radius.control);
    expect(squash(popover.get('box-shadow'))).toBe(squash(shadow.overlay));
    // 팝오버의 투명한 가림막은 overlay 색으로 칠하지 않는다.
    const invisible = baseStyle(html, 'MuiBackdrop-invisible');
    expect(invisible.get('background-color')).toBe('transparent');
  });

  it('아이콘 버튼: size="large" 는 누르는 면이 44 이고, sx 의 안쪽 여백을 막지 않는다', () => {
    const html = render(mui, (m) => [
      h(m.IconButton, { key: 'large', size: 'large', 'aria-label': '메뉴' }, h('svg', { className: 'MuiSvgIcon-root' })),
      h(
        m.IconButton,
        { key: 'padded', size: 'small', sx: { p: '12px' }, 'aria-label': '지우기' },
        h('svg', { className: 'MuiSvgIcon-root' }),
      ),
    ]);
    const large = baseStyle(html, 'MuiIconButton-sizeLarge');
    expect(large.get('min-width')).toBe(height.buttonTouch);
    expect(large.get('min-height')).toBe(height.buttonTouch);
    expect(large.has('width')).toBe(false);
    expect(large.has('height')).toBe(false);
    // sx 는 테마 뒤에 붙는다. 폭과 높이를 고정하지 않으므로 이 여백만큼 누르는 면이 커진다.
    const padded = baseStyle(html, 'MuiIconButton-sizeSmall');
    expect(padded.get('padding')).toBe('12px');
    expect(padded.get('min-width')).toBe(component.iconButton.size);
    expect(padded.has('width')).toBe(false);
    expect(padded.has('height')).toBe(false);
  });

  it('화면을 채우는 판(fullScreen)은 모서리와 overlay 그림자를 받지 않는다', () => {
    const html = render(mui, (m) =>
      h(m.Dialog, { open: true, fullScreen: true, disablePortal: true }, h(m.DialogTitle, null, '회원 수정')),
    );
    const paper = baseStyle(html, 'MuiDialog-paperFullScreen');
    expect(paper.get('border-radius')).toBe('0');
    expect(squash(paper.get('box-shadow'))).not.toBe(squash(shadow.overlay));
  });

  it('README 의 앱 설정: paper 콜백이 공용 값을 펴 넣어도 fullScreen 판은 MUI 기본 모서리다', () => {
    const sharedPaper = muiThemeOptions.components?.MuiDialog?.styleOverrides?.paper as object;
    const theme = mui.createTheme(muiThemeOptions, {
      components: {
        MuiDialog: {
          styleOverrides: {
            paper: ({ ownerState, theme: t }: { ownerState: { fullScreen?: boolean }; theme: Mui }) =>
              ownerState.fullScreen ? {} : { ...sharedPaper, [t.breakpoints.down('sm')]: { margin: 16 } },
          },
        },
      },
    });
    const dialog = (fullScreen: boolean) =>
      render(
        mui,
        (m) => h(m.Dialog, { open: true, fullScreen, disablePortal: true }, h(m.DialogTitle, null, '판')),
        theme,
      );
    const normal = baseStyle(dialog(false), 'MuiDialog-paper');
    expect(normal.get('border-radius')).toBe(radius.card);
    expect(squash(normal.get('box-shadow'))).toBe(squash(shadow.overlay));
    const full = baseStyle(dialog(true), 'MuiDialog-paperFullScreen');
    expect(full.get('border-radius')).toBe('0');
  });

  it('body 바탕은 palette.background.default 를 따른다(앱이 흰색으로 바꾸면 흰색)', () => {
    const app = mui.createTheme(muiThemeOptions, { palette: { background: { default: '#fff' } } });
    const html = render(mui, (m) => h(m.CssBaseline), app);
    const body = declarations(styleText(html), 'body');
    expect(body.get('background-color')).toBe('#fff');
    expect(body.get('color')).toBe(colors.text.body);
  });

  it('초점 테두리: 버튼은 바깥에, 탭·메뉴 항목·서랍 목록·스위치는 안쪽에 긋는다', () => {
    const html = render(mui, (m) => [
      h(m.Button, { key: 'button', variant: 'contained' }, '저장'),
      h(m.Tabs, { key: 'tabs', value: 0 }, h(m.Tab, { label: '재학생' })),
      h(m.MenuList, { key: 'menu' }, h(m.MenuItem, null, '내보내기')),
      h(m.ListItemButton, { key: 'list' }, '회원'),
      h(m.Switch, { key: 'switch', defaultChecked: true }),
    ]);
    const css = styleText(html);
    const focusRule = (muiClass: string | string[]) =>
      declarations(css, `.${emotionClass(html, muiClass)}.Mui-focusVisible`);

    const button = focusRule('MuiButton-root');
    expect(button.get('outline')).toBe(`${component.focusRing.width} solid ${colors.brand.main}`);
    expect(button.get('outline-offset')).toBe(component.focusRing.offset);

    const inset = `calc(-1 * ${component.focusRing.width})`;
    for (const part of ['MuiTab-root', 'MuiMenuItem-root', 'MuiListItemButton-root', 'MuiSwitch-switchBase']) {
      const rule = focusRule(part);
      expect(rule.get('outline'), part).toBe(`${component.focusRing.width} solid ${colors.brand.main}`);
      expect(rule.get('outline-offset'), part).toBe(inset);
    }
  });

  it('그림자는 카드와 판 두 가지다: 상단 바 없음, 서랍(temporary)·토스트는 판, Card 는 카드', () => {
    const html = render(mui, (m) => [
      h(m.AppBar, { key: 'bar', position: 'static' }, '관리자'),
      h(m.Card, { key: 'card' }, '로그인'),
      h(m.SnackbarContent, { key: 'toast', message: '저장했습니다' }),
    ]);

    // Paper 는 elevation 그림자를 인라인 변수(--Paper-shadow)로 준다. 상단 바는 elevation 0 이다.
    const bar = html.match(/<header[^>]*class="[^"]*MuiAppBar-root[^"]*"[^>]*>/)?.[0] ?? '';
    expect(bar).toContain('MuiPaper-elevation0');
    expect(bar).toMatch(/--Paper-shadow:\s*none/);

    const card = baseStyle(html, 'MuiCard-root');
    expect(card.get('border')).toBe(`1px solid ${colors.border.default}`);
    expect(card.get('border-radius')).toBe(radius.card);
    // Card 의 그림자는 elevation 이 고른다. 테마가 box-shadow 를 고정하면 elevation={0} 이 그림자를 지우지 못한다.
    expect(card.get('box-shadow')).toBe('var(--Paper-shadow)');

    expect(squash(baseStyle(html, 'MuiSnackbarContent-root').get('box-shadow'))).toBe(squash(shadow.overlay));

    // MUI 9 는 서랍 paper 에 anchor·docked 를 겹친 class 를 두지 않는다. 그래서 두 서랍을 따로 그린다.
    const side = render(mui, (m) =>
      h(m.Drawer, { open: true, anchor: 'right', ModalProps: { disablePortal: true } }, '회원'),
    );
    expect(squash(baseStyle(side, 'MuiDrawer-paper').get('box-shadow'))).toBe(squash(shadow.overlay));
    const nav = render(mui, (m) => h(m.Drawer, { variant: 'permanent' }, '메뉴'));
    expect(squash(baseStyle(nav, 'MuiDrawer-paper').get('box-shadow'))).not.toBe(squash(shadow.overlay));
  });

  it('elevation 그림자 25개는 없음, 카드, 판 세 값뿐이다', () => {
    const { shadows } = mui.createTheme(muiThemeOptions);
    expect(shadows).toHaveLength(25);
    expect(shadows[0]).toBe('none');
    for (let elevation = 1; elevation < 6; elevation += 1) expect(shadows[elevation], `${elevation}`).toBe(shadow.card);
    for (let elevation = 6; elevation < 25; elevation += 1) expect(shadows[elevation], `${elevation}`).toBe(shadow.overlay);
  });

  it('elevation 을 준 Paper 와 Card 도 카드 또는 판 그림자를 받고, elevation 0 은 그림자가 없다', () => {
    const paperShadow = (part: 'Paper' | 'Card', elevation?: number) => {
      const html = render(mui, (m) => h(m[part], elevation === undefined ? null : { elevation }, '면'));
      const tag = html.match(/<div[^>]*class="[^"]*MuiPaper-root[^"]*"[^>]*>/)?.[0] ?? '';
      return squash(tag.match(/--Paper-shadow:\s*([^;"]+)/)?.[1] ?? '');
    };
    expect(paperShadow('Paper', 1)).toBe(squash(shadow.card));
    expect(paperShadow('Paper', 3)).toBe(squash(shadow.card));
    expect(paperShadow('Paper', 8)).toBe(squash(shadow.overlay));
    expect(paperShadow('Card')).toBe(squash(shadow.card));
    expect(paperShadow('Card', 0)).toBe('none');
  });

  it('Switch 는 견본의 바탕 두 색과 손잡이 윤곽을 갖는다', () => {
    const parts = (theme: unknown, props: Record<string, unknown>) => {
      const html = render(mui, (m) => h(m.Switch, props), theme);
      return {
        css: styleText(html),
        thumb: `.${emotionClass(html, 'MuiSwitch-thumb')}`,
        track: `.${emotionClass(html, 'MuiSwitch-track')}`,
        base: `.${emotionClass(html, 'MuiSwitch-switchBase')}`,
      };
    };

    // 대조군: MUI 기본 테마의 손잡이는 elevation 1 그림자이고 꺼진 바탕은 검정을 0.38 로 옅게 깐다. 이 테마의
    // elevation 1 은 거의 보이지 않는 카드 그림자라서, 손잡이 윤곽을 따로 주지 않으면 흰 카드 위에서 사라진다.
    const plain = parts(mui.createTheme(), {});
    expect(lastValue(plain.css, plain.thumb, 'box-shadow')).toMatch(/rgba\(0,\s*0,\s*0,\s*0\.2\)/);
    expect(lastValue(plain.css, plain.track, 'opacity')).toBe('0.38');

    const off = parts(undefined, {});
    expect(squash(lastValue(off.css, off.thumb, 'box-shadow'))).toBe(squash(component.switch.thumbShadow));
    expect(lastValue(off.css, off.track, 'background-color')).toBe(component.switch.trackOff);
    expect(lastValue(off.css, off.track, 'opacity')).toBe('1');

    // 켜진 바탕은 MUI 가 '.Mui-checked + 바탕' 으로 칠한다. 테마 규칙이 같은 선택자로 뒤에 와서 이긴다.
    const on = parts(undefined, { defaultChecked: true });
    const checkedTrack = `${on.base}.Mui-checked+.MuiSwitch-track`;
    expect(lastValue(on.css, checkedTrack, 'background-color')).toBe(component.switch.trackOn);
    expect(lastValue(on.css, checkedTrack, 'opacity')).toBe('1');

    // 꺼진 스위치의 옅은 바탕은 MUI 기본 그대로다(더 높은 우선순위의 '.Mui-disabled + 바탕').
    const disabled = parts(undefined, { disabled: true });
    expect(lastValue(disabled.css, `${disabled.base}.Mui-disabled+.MuiSwitch-track`, 'opacity')).toBe('0.12');
  });

  it('outlined 라벨은 입력 글자와 같은 단계라 테두리 틈과 폭이 맞고, 입력 글자의 안쪽 여백에 선다', () => {
    const field = (theme: unknown, props: Record<string, unknown>) => {
      const html = render(mui, (m) => h(m.TextField, { label: '이름', ...props }), theme);
      const css = styleText(html);
      return {
        css,
        label: `.${emotionClass(html, ['MuiInputLabel-root', 'MuiInputLabel-outlined'])}`,
        input: `.${emotionClass(html, 'MuiOutlinedInput-root')}`,
      };
    };

    // 대조군: MUI 기본 라벨은 16px 이고 입력 글자도 16px 이다. 이 테마는 입력 글자를 15px 로 바꾸므로 라벨도 함께
    // 바꾸지 않으면 줄어든 라벨(16 의 0.75배)이 틈(15 의 0.75배)보다 넓어 선이 라벨 끝을 가로지른다.
    const plain = field(mui.createTheme(), {});
    expect(lastValue(plain.css, plain.label, 'font-size')).toBe('1rem');

    const empty = field(undefined, {});
    expect(lastValue(empty.css, empty.label, 'font-size')).toBe(levels.body.fontSize);
    expect(lastValue(empty.css, `${empty.input}`, 'font-size')).toBe(levels.body.fontSize);
    expect(lastValue(empty.css, empty.label, 'transform')).toBe(
      `translate(${component.input.paddingX}, calc((${height.input} - ${levels.body.lineHeight}) / 2)) scale(1)`,
    );

    const filled = field(undefined, { defaultValue: '김민준' });
    expect(lastValue(filled.css, filled.label, 'transform')).toBe(`translate(${component.input.paddingX}, -9px) scale(0.75)`);
    // 틈은 라벨보다 6 앞에서 시작한다(MUI 기본의 라벨 14, 틈 8 과 같은 사이).
    expect(lastValue(filled.css, `${filled.input} .MuiOutlinedInput-notchedOutline`, 'padding')).toBe(
      `0 calc(${component.input.paddingX} - 6px)`,
    );
  });

  it('탭 줄: 고른 탭의 밑줄이 탭 줄 아래 선을 덮고, 줄 높이는 탭 44 와 선 1 을 더한 45 다', () => {
    // 탭 줄을 세로로 잰다(위가 0, 단위 px). 마운트 뒤 MUI 는 밑줄(indicator)을 scroller 의 자식으로 두고 scroller
    // 안쪽의 bottom 에 세운다. 서버 렌더에서는 밑줄이 아직 고른 탭 안에 있지만 값은 같은 규칙에서 읽는다.
    // scroller 와 뿌리는 overflow 를 숨기므로 밑줄은 scroller 안쪽에서만 보이고, 그 밖에 붙는 뿌리의 border 는 덮지 못한다.
    const measure = (theme: unknown, props: Record<string, unknown> = {}) => {
      const html = render(
        mui,
        (m) => h(m.Tabs, { value: 0, ...props }, h(m.Tab, { label: '재학생' }), h(m.Tab, { label: '만료' })),
        theme,
      );
      const css = styleText(html);
      const read = (muiClass: string, prop: string) => lastValue(css, `.${emotionClass(html, muiClass)}`, prop);
      const px = (value: string | undefined) => (value === undefined ? 0 : Number.parseFloat(value));
      // scroller 안쪽의 아래 끝. 탭 높이에 scroller 의 아래 여백을 더한다. 뿌리에는 여백이 없어 뿌리 안쪽의 아래 끝도 같다.
      const inner = px(read('MuiTab-root', 'height')) + px(read('MuiTabs-scroller', 'padding-bottom'));
      // 선이 뿌리의 border 면 그 아래 끝의 바깥에, 뿌리 안쪽의 아래 그림자면 그 아래 끝의 안쪽에 선다.
      const border = read('MuiTabs-root', 'border-bottom')?.match(/^(\d+)px solid (\S+)$/);
      const inset = read('MuiTabs-root', 'box-shadow')?.match(/^inset 0 -(\d+)px 0 (\S+)$/);
      const outside = border ? Number(border[1]) : 0;
      const line = border
        ? { top: inner, bottom: inner + outside, color: border[2] }
        : inset
          ? { top: inner - Number(inset[1]), bottom: inner, color: inset[2] }
          : null;
      const lift = px(read('MuiTabs-indicator', 'bottom'));
      const underline = { top: inner - lift - px(read('MuiTabs-indicator', 'height')), bottom: inner - lift };
      return {
        height: inner + outside,
        line,
        underline,
        covered: line !== null && underline.top <= line.top && line.bottom <= underline.bottom,
      };
    };
    const tab = Number.parseFloat(height.tab);
    const bar = Number.parseFloat(component.tab.indicatorHeight);
    const line = { top: tab, bottom: tab + 1, color: colors.border.subtle };

    // 대조군: 옛 짜임(0.1.0)은 선을 뿌리의 border 로 그었다. 밑줄(42~44)은 탭 안에 서고 선(44~45)은 scroller 밖에
    // 남아서, 밑줄이 선 위 1px 에 뜨고 그 아래 옅은 선이 보였다.
    const tabsOptions = muiThemeOptions.components?.MuiTabs;
    const old = mui.createTheme({
      ...muiThemeOptions,
      components: {
        ...muiThemeOptions.components,
        MuiTabs: {
          ...tabsOptions,
          styleOverrides: {
            ...tabsOptions?.styleOverrides,
            root: { minHeight: height.tab, borderBottom: `1px solid ${colors.border.subtle}` },
            scroller: {},
          },
        },
      },
    });
    expect(measure(old)).toEqual({ height: tab + 1, line, underline: { top: tab - bar, bottom: tab }, covered: false });

    // 견본(.tabs 의 아래 선, .tab.on::after 의 bottom -1px)처럼 밑줄(43~45)이 선(44~45)을 덮는다. 넘치는 탭 줄
    // (scrollable)도 scroller 가 같으므로 같다.
    for (const props of [{}, { variant: 'scrollable' }]) {
      expect(measure(undefined, props), JSON.stringify(props)).toEqual({
        height: tab + 1,
        line,
        underline: { top: tab + 1 - bar, bottom: tab + 1 },
        covered: true,
      });
    }

    // 세로 탭에는 아래 선이 없고 scroller 아래 여백도 없다.
    expect(measure(undefined, { orientation: 'vertical' })).toMatchObject({ height: tab, line: null });
  });

  it('Slider 손잡이에 색 고리 그림자가 없고, 키보드 초점은 남색 테두리다', () => {
    const slider = (theme?: unknown) => {
      const html = render(mui, (m) => h(m.Slider, { defaultValue: 30 }), theme);
      return { css: styleText(html), thumb: `.${emotionClass(html, 'MuiSlider-thumb')}` };
    };
    const states = [':hover', '.Mui-active', '.Mui-focusVisible'];

    // 대조군: MUI 기본 테마는 주 색 8px·14px 고리와 손잡이 ::before 의 elevation 그림자를 낸다.
    // 이 그림자들이 있어야 아래 검사가 뜻이 있다.
    const plain = slider(mui.createTheme());
    for (const state of states) {
      expect(lastValue(plain.css, `${plain.thumb}${state}`, 'box-shadow'), state).toMatch(/0px 0px 0px (8|14)px rgba/);
    }
    expect(lastValue(plain.css, `${plain.thumb}::before`, 'box-shadow')).toMatch(/rgba/);

    // 같은 우선순위의 규칙을 문서 순서로 읽는다. 테마의 규칙이 MUI 기본 그림자보다 뒤에 와서 이겨야 한다.
    // ::before 규칙에는 상태가 없으므로 꺼진 Slider 의 손잡이에도 그림자가 없다.
    const themed = slider();
    for (const state of [...states, '::before']) {
      expect(lastValue(themed.css, `${themed.thumb}${state}`, 'box-shadow'), state).toBe('none');
    }
    const disabled = render(mui, (m) => h(m.Slider, { defaultValue: 30, disabled: true }));
    const disabledThumb = `.${emotionClass(disabled, 'MuiSlider-thumb')}`;
    expect(lastValue(styleText(disabled), `${disabledThumb}::before`, 'box-shadow')).toBe('none');
    const focus = `${themed.thumb}.Mui-focusVisible`;
    expect(lastValue(themed.css, focus, 'outline')).toBe(`${component.focusRing.width} solid ${colors.brand.main}`);
    expect(lastValue(themed.css, focus, 'outline-offset')).toBe(component.focusRing.offset);
  });
});
