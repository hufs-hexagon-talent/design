import { describe, expect, it } from 'vitest';
import { colors } from '../dist/esm/index.js';
import { contrast } from './helpers';

// 읽는 글자는 놓이는 면에서 4.5:1 이상이어야 한다(docs/rules.md). text.disabled 는 꺼진 조작에만 써서 뺀다.
const MIN = 4.5;

const readableText = {
  'text.primary': colors.text.primary,
  'text.body': colors.text.body,
  'text.secondary': colors.text.secondary,
  'text.tertiary': colors.text.tertiary,
};

const lightSurfaces = {
  'surface.card': colors.surface.card,
  'surface.subtle': colors.surface.subtle,
  'surface.page': colors.surface.page,
  // 누를 수 있는 행의 hover 면과 고른 메뉴의 면. 행과 메뉴의 보조 글자(tertiary)가 이 면 위에 놓인다.
  'surface.hover': colors.surface.hover,
  'surface.selected': colors.surface.selected,
};

type Pair = [label: string, foreground: string, background: string];

const pairs: Pair[] = [
  // 글자 네 단계 × 밝은 면 세 가지
  ...Object.entries(readableText).flatMap(([textName, fg]) =>
    Object.entries(lightSurfaces).map(([surfaceName, bg]): Pair => [`${textName} on ${surfaceName}`, fg, bg]),
  ),
  // 주 색·위험 면 위의 흰 글자(버튼). 성공·경고 면의 흰 글자는 MUI 의 contrastText 다.
  ['white on brand.main', colors.inverse.text.primary, colors.brand.main],
  ['white on brand.hover', colors.inverse.text.primary, colors.brand.hover],
  ['white on status.danger', colors.inverse.text.primary, colors.status.danger],
  ['white on status.success', colors.inverse.text.primary, colors.status.success],
  ['white on status.warning', colors.inverse.text.primary, colors.status.warning],
  // inverse 면(툴팁, 토스트, 짙은 블록) 위의 글자
  ...Object.entries(colors.inverse.text).map(
    ([name, fg]): Pair => [`inverse.text.${name} on surface.inverse`, fg, colors.surface.inverse],
  ),
  // 상태 글자: 표(카드), 알림 상자(subtle), hover 된 행과 바닥(hover, page)
  ...Object.entries(colors.status).flatMap(([name, fg]) => [
    [`status.${name} on surface.card`, fg, colors.surface.card] as Pair,
    [`status.${name} on surface.subtle`, fg, colors.surface.subtle] as Pair,
    [`status.${name} on surface.hover`, fg, colors.surface.hover] as Pair,
    [`status.${name} on surface.page`, fg, colors.surface.page] as Pair,
  ]),
  // 고른 메뉴(surface.selected 위의 brand 글자)와 hover 된 링크
  ['brand.main on surface.selected', colors.brand.main, colors.surface.selected],
  ['brand.main on surface.card', colors.brand.main, colors.surface.card],
];

describe('읽는 글자의 대비', () => {
  it.each(pairs)('%s ≥ 4.5', (_label, fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(MIN);
  });

  it('면 값이 견본과 같다(카드는 흰색)', () => {
    expect(colors.surface.card).toBe('#FFFFFF');
  });

  // 견본 v2 의 색 견본 칸에 적힌 대비 값과 맞춰 본다. 값이 바뀌면 견본도 함께 바뀌어야 한다.
  it.each([
    ['text.primary on card', 17.46, colors.text.primary, colors.surface.card],
    ['text.body on card', 13.61, colors.text.body, colors.surface.card],
    ['text.secondary on card', 6.13, colors.text.secondary, colors.surface.card],
    ['text.tertiary on card', 5.21, colors.text.tertiary, colors.surface.card],
    ['text.tertiary on page', 4.57, colors.text.tertiary, colors.surface.page],
    ['white on brand.main', 13.91, colors.inverse.text.primary, colors.brand.main],
    ['white on brand.hover', 11.29, colors.inverse.text.primary, colors.brand.hover],
    ['status.success on card', 5.34, colors.status.success, colors.surface.card],
    ['status.danger on card', 6.57, colors.status.danger, colors.surface.card],
    ['status.warning on card', 5.43, colors.status.warning, colors.surface.card],
  ] as const)('%s 는 견본 표기 %s 와 같다', (_label, specimen, fg, bg) => {
    expect(contrast(fg, bg)).toBeCloseTo(specimen, 2);
  });

  it('꺼진 글자는 읽는 글자가 아니다(4.5 미만이어도 된다)', () => {
    expect(contrast(colors.text.disabled, colors.surface.disabled)).toBeLessThan(MIN);
  });
});
