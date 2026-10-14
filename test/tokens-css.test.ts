import { readFileSync } from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';
import { tokens } from '../dist/esm/index.js';
import { leaves, root } from './helpers';

const css = readFileSync(path.join(root, 'tokens.css'), 'utf8');

/** :root 안의 --sr-* 선언을 이름 → 값으로 읽는다. */
function readVariables(source: string): Map<string, string> {
  const vars = new Map<string, string>();
  postcss.parse(source).walkRules(':root', (rule) => {
    rule.walkDecls((decl) => {
      if (vars.has(decl.prop)) throw new Error(`duplicate ${decl.prop}`);
      vars.set(decl.prop, decl.value);
    });
  });
  return vars;
}

const kebab = (name: string) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();

/** 이름 규칙: --sr-<묶음>-<경로>, 경로 끝의 main 은 뺀다. 글자는 --sr-font-<단계>-<속성>. */
function expectedVariables(): Array<[string, string]> {
  const named = (group: string, value: unknown) =>
    leaves(value).map(([keys, v]): [string, string] => {
      const parts = keys.filter((key, i) => !(key === 'main' && i === keys.length - 1)).map(kebab);
      return [`--sr-${[group, ...parts].join('-')}`, String(v)];
    });
  const { typography } = tokens;
  const property = { fontSize: 'size', lineHeight: 'line-height', fontWeight: 'weight', letterSpacing: 'letter-spacing' };
  return [
    ...named('color', tokens.colors),
    ['--sr-font-family', typography.fontFamily],
    ...Object.entries(typography.levels).flatMap(([level, values]) =>
      Object.entries(values).map(([prop, v]): [string, string] => [
        `--sr-font-${level}-${property[prop as keyof typeof property]}`,
        String(v),
      ]),
    ),
    ['--sr-font-title-narrow-size', typography.titleNarrow.fontSize],
    ['--sr-font-title-narrow-line-height', typography.titleNarrow.lineHeight],
    ['--sr-font-button-weight', String(typography.buttonWeight)],
    ...named('radius', tokens.radius),
    ...named('shadow', tokens.shadow),
    ...named('height', tokens.height),
    ...named('space', tokens.space),
    ...named('component', tokens.component),
  ];
}

describe('tokens.css', () => {
  const vars = readVariables(css);
  const expected = expectedVariables();

  it('postcss 가 읽을 수 있는 CSS 이고 :root 하나에 --sr-* 만 둔다', () => {
    const rules: string[] = [];
    postcss.parse(css).walkRules((rule) => {
      rules.push(rule.selector);
    });
    expect(rules).toEqual([':root']);
    for (const name of vars.keys()) expect(name).toMatch(/^--sr-[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('토큰 값마다 변수가 하나씩 있다', () => {
    const tokenLeaves = leaves(tokens);
    expect(vars.size).toBe(tokenLeaves.length);
    expect(expected).toHaveLength(tokenLeaves.length);
  });

  it.each(expected)('%s: %s', (name, value) => {
    expect(vars.get(name)).toBe(value);
  });

  it('모든 토큰 값이 tokens.css 안에 들어 있다', () => {
    const values = new Set(vars.values());
    for (const [keys, value] of leaves(tokens)) {
      expect(values.has(String(value)), keys.join('.')).toBe(true);
    }
  });

  it('README 와 docs 가 예로 드는 이름', () => {
    expect(vars.get('--sr-color-brand')).toBe('#002D56');
    expect(vars.get('--sr-color-text-tertiary')).toBe('#676D77');
    expect(vars.get('--sr-radius-card')).toBe('14px');
    expect(vars.get('--sr-shadow-overlay')).toBe(
      '0 14px 38px rgba(15, 22, 38, 0.15), 0 2px 6px rgba(15, 22, 38, 0.06)',
    );
  });
});
