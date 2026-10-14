import { readFileSync } from 'node:fs';
import path from 'node:path';
import { twMerge } from 'tailwind-merge';
import { describe, expect, it } from 'vitest';
import { requireSelf, root } from './helpers';

// flowbite-react 0.9 는 tailwind-merge 2.2.2 로 class 를 합친다(user-app 의 lock 기준).
// 이 버전은 /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/ 꼴과 base 만 글자 크기로 읽는다.
const preset = requireSelf('@studyroom/design/tailwind');
const fontSizeKeys = Object.keys(preset.theme.extend.fontSize);
const tshirt = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/;

const textColors = [
  ...Object.keys(preset.theme.extend.textColor),
  'brand',
  'brand-hover',
  'brand-subtle',
  'success',
  'danger',
  'warning',
];

describe('tailwind-merge 2.2.2 와 글자 크기 이름', () => {
  it('설치된 tailwind-merge 가 2.2.2 이다', () => {
    // tailwind-merge 는 package.json 을 exports 에 두지 않아 파일로 읽는다.
    const pkg = JSON.parse(readFileSync(path.join(root, 'node_modules/tailwind-merge/package.json'), 'utf8'));
    expect(pkg.version).toBe('2.2.2');
  });

  it('preset 의 글자 크기 키는 여덟 개이고 모두 t-shirt 이름이나 base 다', () => {
    expect([...fontSizeKeys].sort()).toEqual(['2xl', '2xs', '3xs', 'base', 'lg', 'md', 'sm', 'xs']);
    for (const key of fontSizeKeys) expect(key === 'base' || tshirt.test(key), key).toBe(true);
  });

  it.each(fontSizeKeys.flatMap((size) => textColors.map((color) => [size, color])))(
    'text-%s 와 text-%s 를 함께 두면 둘 다 남는다',
    (size, color) => {
      const classes = `text-${size} text-${color}`;
      expect(twMerge(classes)).toBe(classes);
    },
  );

  it.each(fontSizeKeys.flatMap((a) => fontSizeKeys.filter((b) => b !== a).map((b) => [a, b])))(
    'text-%s 뒤에 text-%s 가 오면 뒤의 것만 남는다',
    (a, b) => {
      expect(twMerge(`text-${a} text-${b}`)).toBe(`text-${b}`);
    },
  );

  it('t-shirt 가 아닌 이름은 글자색을 지운다(그래서 쓰지 않는다)', () => {
    expect(twMerge('text-tertiary text-meta')).toBe('text-meta');
  });

  it('inverse 글자색도 글자색으로 읽혀 글자 크기와 함께 남는다', () => {
    expect(textColors).toEqual(expect.arrayContaining(['inverse-primary', 'inverse-body', 'inverse-secondary', 'inverse-tertiary']));
    expect(twMerge('text-sm text-inverse-secondary')).toBe('text-sm text-inverse-secondary');
    expect(twMerge('text-inverse-secondary text-inverse-body')).toBe('text-inverse-body');
  });
});

describe('tailwind-merge 2.2.2 와 자간 이름', () => {
  const trackingKeys = Object.keys(preset.theme.extend.letterSpacing);

  it('preset 의 자간 키는 자간이 있는 다섯 단계다', () => {
    expect(trackingKeys).toEqual(['title', 'heading', 'prose', 'body', 'control']);
  });

  it.each(trackingKeys.flatMap((tracking) => fontSizeKeys.map((size) => [tracking, size])))(
    'tracking-%s 를 text-%s, 글자색과 함께 두면 셋 다 남는다',
    (tracking, size) => {
      const classes = `tracking-${tracking} text-primary text-${size}`;
      expect(twMerge(classes)).toBe(classes);
    },
  );
});
