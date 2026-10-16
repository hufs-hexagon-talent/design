import * as mui9 from '@mui/material';
import { describe, expect, it } from 'vitest';
import { colors } from '../dist/esm/index.js';
import { muiThemeOptions } from '../dist/esm/mui.js';

// hover 면, 선, 글자색은 마우스처럼 hover 가 되는 기기에서만 그린다. 휴대폰은 손가락으로 누른 요소에 :hover 를
// 바깥을 누를 때까지 남기므로, 조건 없는 '&:hover' 가 색을 바꾸면 누른 버튼에 hover 면이 남는다.
// 이 검사는 테마 객체를 걸어 다니며 ':hover' 가 든 선택자 아래의 선언을 모은다. 부품마다 styleOverrides,
// variants, defaultProps.sx 를 걷고, 콜백은 아래 ownerState 로 불러 갈래마다 나오는 객체를 모두 본다.

const HOVER_DEVICE = '@media (hover: hover)';
const NO_HOVER_DEVICE = '@media (hover: none)';

// 콜백의 갈래(ownerState.multiline ? A : B 같은 것)를 모두 지나게 한다. 모든 키가 거짓인 것, 모든 키가 참인 것,
// 세로 방향(orientation === 'vertical'), MUI 의 색 이름마다 하나씩(ownerState.color === 'error' 같은 갈래)이다.
const allTrue = new Proxy({}, { get: () => true });
const colorNames = ['default', 'inherit', 'primary', 'secondary', 'error', 'info', 'success', 'warning'];
const ownerStates: object[] = [
  {},
  allTrue,
  { orientation: 'vertical' },
  ...colorNames.map((color) => ({ color })),
];
const theme = mui9.createTheme(muiThemeOptions);

interface Rule {
  component: string;
  path: string[];
  decls: Record<string, string | number>;
}

function walk(component: string, value: unknown, path: string[], out: Rule[]): void {
  if (typeof value === 'function') {
    for (const ownerState of ownerStates) walk(component, value({ ownerState, theme }), [...path, '(ownerState)'], out);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((child, index) => walk(component, child, [...path, `[${index}]`], out));
    return;
  }
  if (value === null || typeof value !== 'object') return;
  const decls: Record<string, string | number> = {};
  for (const [key, child] of Object.entries(value)) {
    // variants 의 props 는 고르는 조건이지 스타일이 아니다.
    if (key === 'props' && path.at(-1)?.startsWith('[')) continue;
    if (child !== null && (typeof child === 'object' || typeof child === 'function')) {
      walk(component, child, [...path, key], out);
    } else if (child !== undefined) {
      decls[key] = child as string | number;
    }
  }
  if (Object.keys(decls).length > 0) out.push({ component, path, decls });
}

interface ComponentOptions {
  styleOverrides?: unknown;
  variants?: unknown;
  defaultProps?: { sx?: unknown };
}

const rules: Rule[] = [];
for (const [component, options] of Object.entries(muiThemeOptions.components ?? {})) {
  const { styleOverrides, variants, defaultProps } = options as ComponentOptions;
  walk(component, styleOverrides, ['styleOverrides'], rules);
  walk(component, variants, ['variants'], rules);
  walk(component, defaultProps?.sx, ['defaultProps.sx'], rules);
}

const isHover = (key: string) => key.toLowerCase().includes(':hover');
const hoverRules = rules.filter((rule) => rule.path.some(isHover));
const under = (media: string) => (rule: Rule) => rule.path.includes(media);
const label = (rule: Rule) => `${rule.component} ${rule.path.join(' > ')} ${JSON.stringify(rule.decls)}`;
// 콜백은 ownerState 마다 불러서 같은 규칙이 여러 번 나온다. 보고는 한 번씩만 한다.
const labels = (found: Rule[]) => [...new Set(found.map(label))];

describe('hover 는 hover 가 되는 기기에서만 그린다', () => {
  it('테마의 hover 규칙을 찾는다(걸어 다니기가 콜백과 variants 까지 들어간다)', () => {
    const components = new Set(hoverRules.filter(under(HOVER_DEVICE)).map((rule) => rule.component));
    expect([...components].sort()).toEqual(['MuiButton', 'MuiIconButton', 'MuiOutlinedInput', 'MuiTableRow']);
  });

  it("조건 없는 '&:hover' 는 그림자를 지우는 것(boxShadow: 'none')만 둔다", () => {
    const unconditional = hoverRules.filter(
      (rule) => !rule.path.includes(HOVER_DEVICE) && !rule.path.includes(NO_HOVER_DEVICE),
    );
    const offenders = unconditional.filter((rule) =>
      Object.entries(rule.decls).some(([prop, value]) => !(prop === 'boxShadow' && value === 'none')),
    );
    expect(labels(offenders)).toEqual([]);
  });

  it('hover 가 없는 기기의 hover 규칙은 MUI 가 칠한 hover 값을 누르기 전 모양으로 되돌리기만 한다', () => {
    // 되돌리는 자리마다 누르기 전 값을 적어 둔다. 새 자리가 생기면 여기에 그 자리의 누르기 전 값을 더한다.
    const { primary, action } = theme.palette;
    const resetValues: Record<string, Record<string, string>> = {
      'MuiOutlinedInput &:hover:not(.Mui-focused):not(.Mui-error):not(.Mui-disabled) .MuiOutlinedInput-notchedOutline':
        { borderColor: colors.border.control },
      'MuiTableRow &.MuiTableRow-hover:not(.Mui-selected):hover': { backgroundColor: 'transparent' },
      'MuiTableRow &.MuiTableRow-hover.Mui-selected:hover': {
        backgroundColor: mui9.alpha(primary.main, action.selectedOpacity),
      },
    };
    const resets = hoverRules.filter(under(NO_HOVER_DEVICE));
    const found = resets.map((rule) => {
      const selector = rule.path.slice(rule.path.indexOf(NO_HOVER_DEVICE) + 1).join(' ');
      return { key: `${rule.component} ${selector}`, decls: rule.decls };
    });
    expect([...new Set(found.map((reset) => reset.key))].sort()).toEqual(Object.keys(resetValues).sort());
    for (const { key, decls } of found) expect(decls).toEqual(resetValues[key]);
  });
});
