import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import * as esmIndex from '../dist/esm/index.js';
import * as esmMui from '../dist/esm/mui.js';
import { requireSelf, root } from './helpers';

const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));

function jsFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return jsFiles(full);
    return entry.name.endsWith('.js') ? [full] : [];
  });
}

describe('패키지 구성', () => {
  it('공개 게시를 막고, 릴리스 주소의 저장소를 가리킨다', () => {
    expect(pkg.private).toBe(true);
    expect(pkg.license).toBe('UNLICENSED');
    expect(pkg.repository).toBe('github:hufs-hexagon-talent/design');
    expect(pkg.files).toEqual(['dist', 'docs', 'mui', 'tailwind', 'tokens.css']);
    expect(pkg.sideEffects).toEqual(['*.css']);
    expect(Object.keys(pkg.exports)).toEqual(['.', './mui', './tailwind', './tokens.css', './package.json']);
    expect(pkg.peerDependenciesMeta['@mui/material'].optional).toBe(true);
    // 테스트가 확인하는 메이저(7, 9)까지만 받는다. 새 메이저는 테스트를 더한 뒤 넓힌다.
    expect(pkg.peerDependencies['@mui/material']).toBe('>=7 <10');
  });

  it('산출 JS 는 @mui 와 react 를 import 하지 않는다', () => {
    const files = jsFiles(path.join(root, 'dist'));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const code = readFileSync(file, 'utf8');
      expect(code, file).not.toMatch(/(require\(|from\s+|import\()\s*['"](@mui\/|react)/);
    }
  });

  it('dist/esm 은 type module 이다', () => {
    expect(JSON.parse(readFileSync(path.join(root, 'dist/esm/package.json'), 'utf8'))).toEqual({ type: 'module' });
  });

  it('require 로 읽은 CJS 와 import 로 읽은 ESM 이 같은 값을 준다', () => {
    const cjsIndex = requireSelf('@studyroom/design');
    const cjsMui = requireSelf('@studyroom/design/mui');
    expect(cjsIndex.tokens).toEqual(esmIndex.tokens);
    expect(JSON.stringify(cjsMui.muiThemeOptions)).toBe(JSON.stringify(esmMui.muiThemeOptions));
  });

  it('Jest 27 처럼 exports 를 읽지 않아도 하위 폴더 shim 과 루트 CSS 로 찾는다', () => {
    const shimMui = requireSelf(path.join(root, 'mui'));
    const shimTailwind = requireSelf(path.join(root, 'tailwind'));
    expect(shimMui).toBe(requireSelf(path.join(root, 'dist/cjs/mui.js')));
    expect(shimTailwind).toBe(requireSelf(path.join(root, 'dist/cjs/tailwind.js')));
    expect(requireSelf(path.join(root, 'package.json')).main).toBe('./dist/cjs/index.js');
    expect(existsSync(path.join(root, 'tokens.css'))).toBe(true);
    expect(requireSelf.resolve('@studyroom/design/tokens.css')).toBe(path.join(root, 'tokens.css'));
  });

  it('Node ESM 이 패키지 이름으로 읽는다', () => {
    const script = [
      "const { tokens } = await import('@studyroom/design');",
      "const { muiThemeOptions } = await import('@studyroom/design/mui');",
      "const preset = (await import('@studyroom/design/tailwind')).default;",
      'console.log(JSON.stringify([tokens.colors.brand.main, muiThemeOptions.palette.primary.main, Object.keys(preset.theme)]));',
    ].join('\n');
    const out = execFileSync(process.execPath, ['--input-type=module', '-e', script], { cwd: root, encoding: 'utf8' });
    expect(JSON.parse(out)).toEqual(['#002D56', '#002D56', ['extend']]);
  });

  it('files 에 든 경로가 빌드 뒤에 모두 있다', () => {
    for (const entry of pkg.files) expect(existsSync(path.join(root, entry)), entry).toBe(true);
    for (const target of ['dist/esm/index.d.ts', 'dist/esm/mui.d.ts', 'dist/cjs/index.d.ts', 'dist/cjs/mui.d.ts', 'dist/cjs/tailwind.d.ts']) {
      expect(existsSync(path.join(root, target)), target).toBe(true);
    }
  });

  it('MUI 타입 확장이 산출 d.ts 에 들어 있다', () => {
    for (const file of ['dist/esm/mui.d.ts', 'dist/cjs/mui.d.ts']) {
      const dts = readFileSync(path.join(root, file), 'utf8');
      expect(dts).toContain("declare module '@mui/material/styles'");
      expect(dts).toContain("declare module '@mui/material/Typography'");
      expect(dts).toContain('TypographyPropsVariantOverrides');
    }
  });
});
