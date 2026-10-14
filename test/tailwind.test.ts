import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import { beforeAll, describe, expect, it } from 'vitest';
import { colors, radius, shadow, typography } from '../dist/esm/index.js';
import { declarations, requireSelf, rgbPrefix } from './helpers';

// user-app 과 같은 짜임: theme.colors 를 통째로 바꾸고, preset 은 require 로 읽는다.
const preset = requireSelf('@studyroom/design/tailwind');

const used = [
  'text-2xl', 'text-lg', 'text-base', 'text-md', 'text-sm', 'text-xs', 'text-2xs', 'text-3xs',
  'tracking-title', 'tracking-heading', 'tracking-prose', 'tracking-body', 'tracking-control',
  'rounded-lg', 'rounded-2xl', 'shadow-sm', 'shadow-xl', 'font-sans',
  'bg-brand', 'bg-brand-hover', 'bg-brand-subtle', 'text-brand', 'border-brand',
  'text-success', 'text-danger', 'text-warning', 'bg-danger', 'bg-success', 'bg-warning',
  'text-primary', 'text-body', 'text-secondary', 'text-tertiary', 'text-disabled',
  'text-inverse-primary', 'text-inverse-body', 'text-inverse-secondary', 'text-inverse-tertiary',
  'bg-page', 'bg-card', 'bg-subtle', 'bg-hover', 'bg-selected', 'bg-disabled', 'bg-inverse', 'bg-overlay',
  'border', 'border-default', 'border-subtle', 'border-control', 'border-strong',
  'ring-offset-inverse',
  // 앱 자체 색과, 있으면 안 되는 Tailwind 기본 팔레트
  'bg-footermainbg', 'text-footertextcolor', 'bg-gray-200', 'text-cyan-500',
  // preset 이 건드리지 않는 기본 키
  'text-xl', 'rounded-md', 'shadow', 'tracking-tight',
];

const userAppLikeConfig = {
  presets: [preset],
  content: [{ raw: `<div class="${used.join(' ')}"></div>`, extension: 'html' }],
  theme: {
    extend: {},
    colors: {
      footermainbg: '#24262a',
      footertextcolor: '#d5d6d8',
    },
  },
  plugins: [],
};

let css = '';
beforeAll(async () => {
  const result = await postcss([tailwindcss(userAppLikeConfig)]).process(
    '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n',
    { from: undefined },
  );
  css = result.css;
});

const rule = (selector: string) => declarations(css, selector);

describe('Tailwind preset 의 모양', () => {
  it('module.exports 가 곧 preset 이고, theme.extend 만 있다', () => {
    expect(preset.default).toBeUndefined();
    expect(Object.keys(preset)).toEqual(['theme']);
    expect(Object.keys(preset.theme)).toEqual(['extend']);
    expect(preset.plugins).toBeUndefined();
    expect(preset.presets).toBeUndefined();
  });
});

describe('Tailwind 3.4 가 만든 class (theme.colors 를 바꾼 앱 설정)', () => {
  it.each([
    ['text-2xl', 'title'],
    ['text-lg', 'heading'],
    ['text-base', 'prose'],
    ['text-md', 'body'],
    ['text-sm', 'control'],
    ['text-xs', 'meta'],
    ['text-2xs', 'label'],
    ['text-3xs', 'micro'],
  ] as const)('.%s = %s 단계의 크기와 줄높이, 굵기 없음', (cls, level) => {
    const decls = rule(`.${cls}`);
    expect(decls.get('font-size')).toBe(typography.levels[level].fontSize);
    expect(decls.get('line-height')).toBe(typography.levels[level].lineHeight);
    expect(decls.has('font-weight')).toBe(false);
    expect(decls.has('letter-spacing')).toBe(false);
  });

  it('.text-xs 13px/18px, .text-md 15px/22px', () => {
    expect(rule('.text-xs').get('font-size')).toBe('13px');
    expect(rule('.text-xs').get('line-height')).toBe('18px');
    expect(rule('.text-md').get('font-size')).toBe('15px');
    expect(rule('.text-md').get('line-height')).toBe('22px');
  });

  it('자간: 자간이 있는 단계마다 tracking-<단계> 가 있고 값이 같다', () => {
    const withSpacing = Object.entries(typography.levels).filter(([, level]) => level.letterSpacing !== '0');
    expect(withSpacing.map(([name]) => name)).toEqual(['title', 'heading', 'prose', 'body', 'control']);
    for (const [name, level] of withSpacing) {
      expect(rule(`.tracking-${name}`).get('letter-spacing'), name).toBe(level.letterSpacing);
    }
    expect(rule('.tracking-title').get('letter-spacing')).toBe('-0.02em');
    expect(rule('.tracking-body').get('letter-spacing')).toBe('-0.01em');
  });

  it('모서리: rounded-lg 8px, rounded-2xl 14px', () => {
    expect(rule('.rounded-lg').get('border-radius')).toBe(radius.control);
    expect(rule('.rounded-2xl').get('border-radius')).toBe('14px');
  });

  it('그림자: shadow-sm 카드, shadow-xl overlay', () => {
    expect(rule('.shadow-sm').get('--tw-shadow')).toBe(shadow.card);
    expect(rule('.shadow-xl').get('--tw-shadow')).toBe(shadow.overlay);
  });

  it('font-sans 와 preflight 의 html 글꼴이 토큰 글꼴이다', () => {
    expect(rule('.font-sans').get('font-family')).toBe(typography.fontFamily);
    const html = [...css.matchAll(/html,\s*:host\s*\{([^}]*)\}/g)].map((m) => m[1]).join('');
    expect(html).toContain(typography.fontFamily);
  });

  it.each([
    ['bg-brand', 'background-color', colors.brand.main],
    ['bg-brand-hover', 'background-color', colors.brand.hover],
    ['bg-brand-subtle', 'background-color', colors.brand.subtle],
    ['text-brand', 'color', colors.brand.main],
    ['border-brand', 'border-color', colors.brand.main],
    ['text-success', 'color', colors.status.success],
    ['text-danger', 'color', colors.status.danger],
    ['text-warning', 'color', colors.status.warning],
    ['bg-danger', 'background-color', colors.status.danger],
    ['bg-success', 'background-color', colors.status.success],
    ['bg-warning', 'background-color', colors.status.warning],
    ['text-primary', 'color', colors.text.primary],
    ['text-body', 'color', colors.text.body],
    ['text-secondary', 'color', colors.text.secondary],
    ['text-tertiary', 'color', colors.text.tertiary],
    ['text-disabled', 'color', colors.text.disabled],
    ['text-inverse-primary', 'color', colors.inverse.text.primary],
    ['text-inverse-body', 'color', colors.inverse.text.body],
    ['text-inverse-secondary', 'color', colors.inverse.text.secondary],
    ['text-inverse-tertiary', 'color', colors.inverse.text.tertiary],
    ['bg-page', 'background-color', colors.surface.page],
    ['bg-card', 'background-color', colors.surface.card],
    ['bg-subtle', 'background-color', colors.surface.subtle],
    ['bg-hover', 'background-color', colors.surface.hover],
    ['bg-selected', 'background-color', colors.surface.selected],
    ['bg-disabled', 'background-color', colors.surface.disabled],
    ['bg-inverse', 'background-color', colors.surface.inverse],
    ['border-default', 'border-color', colors.border.default],
    ['border-subtle', 'border-color', colors.border.subtle],
    ['border-control', 'border-color', colors.border.control],
    ['border-strong', 'border-color', colors.border.strong],
  ] as const)('.%s → %s %s', (cls, prop, hex) => {
    expect(rule(`.${cls}`).get(prop)).toContain(rgbPrefix(hex));
  });

  it('.ring-offset-inverse 는 inverse 면 색이다(바닥글의 초점 고리)', () => {
    // 고리 사이 색에는 투명도 변수가 없어 Tailwind 가 hex 를 그대로 둔다.
    expect(rule('.ring-offset-inverse').get('--tw-ring-offset-color')).toBe(colors.surface.inverse);
  });

  it('.bg-overlay 는 가림막 색(투명도 0.42)이다', () => {
    const value = rule('.bg-overlay').get('background-color') ?? '';
    expect(value.replace(/\s+/g, ' ')).toMatch(/^(rgba\(15, 22, 38, 0\.42\)|rgb\(15 22 38 \/ 0\.42\))$/);
  });

  it('색 없는 border 는 border.default 색이다(preflight)', () => {
    expect(rule('.border').get('border-width')).toBe('1px');
    const reset = [...css.matchAll(/\*,\s*::before,\s*::after\s*\{([^}]*)\}/g)].map((m) => m[1]).join('');
    expect(reset).toContain(`border-color: ${colors.border.default}`);
  });

  it('앱의 theme.colors 는 그대로이고, preset 은 기본 팔레트를 되살리지 않는다', () => {
    expect(rule('.bg-footermainbg').get('background-color')).toContain(rgbPrefix('#24262a'));
    expect(rule('.text-footertextcolor').get('color')).toContain(rgbPrefix('#d5d6d8'));
    expect(rule('.bg-gray-200').size).toBe(0);
    expect(rule('.text-cyan-500').size).toBe(0);
  });

  it('preset 이 덮지 않는 키는 Tailwind 기본값이다', () => {
    expect(rule('.text-xl').get('font-size')).toBe('1.25rem');
    expect(rule('.rounded-md').get('border-radius')).toBe('0.375rem');
    expect(rule('.shadow').get('--tw-shadow')).toBe('0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)');
    expect(rule('.tracking-tight').get('letter-spacing')).toBe('-0.025em');
  });
});
