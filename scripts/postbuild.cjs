// 빌드 뒤처리.
// 1) dist/esm 을 ESM 으로 표시한다. 루트 package.json 에는 "type" 이 없어 기본이 CJS 다.
// 2) 토큰에서 CSS 사용자 정의 속성 파일 tokens.css 를 만든다. 값은 빌드된 dist/cjs/tokens.js 에서만 읽는다.
//    이름은 --sr-<묶음>-<경로> 이고, 경로 끝의 main 은 뺀다(colors.brand.main → --sr-color-brand).
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const { version } = require(path.join(root, 'package.json'));

fs.writeFileSync(
  path.join(root, 'dist/esm/package.json'),
  JSON.stringify({ type: 'module' }, null, 2) + '\n',
);

const { colors, typography, radius, shadow, height, space, component } = require(
  path.join(root, 'dist/cjs/tokens.js'),
);

// paddingXSmall → padding-x-small, rowTwoLine → row-two-line
const kebab = (name) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();

function flatten(group, value, keys = [], out = []) {
  if (value !== null && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) flatten(group, child, [...keys, key], out);
    return out;
  }
  const parts = keys.filter((key, i) => !(key === 'main' && i === keys.length - 1)).map(kebab);
  out.push([`--sr-${[group, ...parts].join('-')}`, String(value)]);
  return out;
}

const fontVars = [
  ['--sr-font-family', typography.fontFamily],
  ...Object.entries(typography.levels).flatMap(([name, level]) => [
    [`--sr-font-${kebab(name)}-size`, level.fontSize],
    [`--sr-font-${kebab(name)}-line-height`, level.lineHeight],
    [`--sr-font-${kebab(name)}-weight`, String(level.fontWeight)],
    [`--sr-font-${kebab(name)}-letter-spacing`, level.letterSpacing],
  ]),
  ['--sr-font-title-narrow-size', typography.titleNarrow.fontSize],
  ['--sr-font-title-narrow-line-height', typography.titleNarrow.lineHeight],
  ['--sr-font-button-weight', String(typography.buttonWeight)],
];

const vars = [
  ...flatten('color', colors),
  ...fontVars,
  ...flatten('radius', radius),
  ...flatten('shadow', shadow),
  ...flatten('height', height),
  ...flatten('space', space),
  ...flatten('component', component),
];

const seen = new Set();
for (const [name] of vars) {
  if (seen.has(name)) throw new Error(`postbuild: duplicate CSS variable ${name}`);
  seen.add(name);
}

const css =
  `/* @studyroom/design ${version}. Generated from src/tokens.ts by scripts/postbuild.cjs. Do not edit. */\n` +
  `:root {\n${vars.map(([name, value]) => `  ${name}: ${value};`).join('\n')}\n}\n`;

fs.writeFileSync(path.join(root, 'tokens.css'), css);
console.log(`postbuild: dist/esm/package.json, tokens.css (${vars.length} variables)`);
