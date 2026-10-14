import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss, { type Rule } from 'postcss';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** 패키지 이름으로 자기 자신을 require 한다(Node 의 self-reference, exports 의 require 조건). */
export const requireSelf = createRequire(path.join(root, 'package.json'));

/** WCAG 2 상대 휘도. */
export function luminance(hex: string): number {
  const value = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(value)) throw new Error(`not a 6-digit hex color: ${hex}`);
  const [r, g, b] = [0, 2, 4]
    .map((i) => Number.parseInt(value.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2 대비. */
export function contrast(a: string, b: string): number {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}

/** '#002D56' → 'rgb(0 45 86' (Tailwind 3 가 내보내는 색 앞부분). */
export function rgbPrefix(hex: string): string {
  const value = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => Number.parseInt(value.slice(i, i + 2), 16));
  return `rgb(${r} ${g} ${b}`;
}

/** 중첩 객체의 끝 값을 [경로, 값] 으로 편다. */
export function leaves(value: unknown, keys: string[] = []): Array<[string[], string | number]> {
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) => leaves(child, [...keys, key]));
  }
  return [[keys, value as string | number]];
}

/**
 * CSS 에서 선택자가 정확히 같은 규칙들의 선언을 모은다(같은 속성은 뒤의 것이 이긴다).
 * @media 안의 규칙(예: MUI 판의 print 규칙)은 화면의 기본 모양이 아니므로 뺀다.
 */
export function declarations(css: string, selector: string): Map<string, string> {
  const found = new Map<string, string>();
  postcss.parse(css).walkRules((rule: Rule) => {
    if (rule.parent?.type !== 'root') return;
    if (rule.selectors.map((s) => s.trim()).join(',') !== selector) return;
    rule.walkDecls((decl) => {
      found.set(decl.prop, decl.value);
    });
  });
  return found;
}

/**
 * 선택자 목록에 selector 가 든 최상위 규칙을 문서 순서로 읽어, 그 속성의 마지막 값을 돌려준다.
 * MUI 7 처럼 '.a:hover,.a.Mui-focusVisible' 로 묶은 규칙도 함께 읽으므로, 같은 우선순위에서 어느 규칙이 이기는지 알 수 있다.
 */
export function lastValue(css: string, selector: string, prop: string): string | undefined {
  let value: string | undefined;
  postcss.parse(css).walkRules((rule: Rule) => {
    if (rule.parent?.type !== 'root') return;
    if (!rule.selectors.map((s) => s.trim()).includes(selector)) return;
    rule.walkDecls(prop, (decl) => {
      value = decl.value;
    });
  });
  return value;
}

/** emotion(stylis)은 쉼표 뒤 공백을 줄인다. 글꼴 목록과 그림자는 공백을 빼고 견준다. */
export const squash = (value: string | undefined) => value?.replace(/,\s+/g, ',');

/** 선택자에 주어진 문자열이 들어간 모든 규칙. emotion class 의 hover, 하위 선택자 등을 찾을 때 쓴다. */
export function rulesContaining(css: string, part: string): Array<{ selector: string; decls: Map<string, string> }> {
  const out: Array<{ selector: string; decls: Map<string, string> }> = [];
  postcss.parse(css).walkRules((rule: Rule) => {
    if (!rule.selector.includes(part)) return;
    const decls = new Map<string, string>();
    rule.walkDecls((decl) => {
      decls.set(decl.prop, decl.value);
    });
    out.push({ selector: rule.selector, decls });
  });
  return out;
}

/** SSR HTML 의 <style> 내용을 모두 잇는다. */
export function styleText(html: string): string {
  return [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
}

/**
 * SSR HTML 에서 주어진 MUI class 를 모두 가진 첫 요소의 emotion class(.sr-xxxx)를 찾는다.
 * MUI 9 는 MuiButton-containedPrimary 같은 겹친 class 를 없앴으므로 ['MuiButton-contained', 'MuiButton-colorPrimary'] 처럼 준다.
 */
export function emotionClass(html: string, muiClasses: string | string[], key = 'sr'): string {
  const wanted = Array.isArray(muiClasses) ? muiClasses : [muiClasses];
  for (const match of html.matchAll(/class="([^"]*)"/g)) {
    const names = match[1].split(/\s+/);
    if (!wanted.every((c) => names.includes(c))) continue;
    const name = names.find((c) => c.startsWith(`${key}-`));
    if (!name) throw new Error(`element with ${wanted.join(' ')} has no ${key}- class: ${match[1]}`);
    return name;
  }
  throw new Error(`no element with classes ${wanted.join(' ')}`);
}

/** 요소의 emotion 기본 규칙 선언. */
export function baseStyle(html: string, muiClasses: string | string[]): Map<string, string> {
  return declarations(styleText(html), `.${emotionClass(html, muiClasses)}`);
}
