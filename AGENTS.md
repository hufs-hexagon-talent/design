# 저장소 지침

이 저장소는 admin-app 과 user-app 이 함께 쓰는 디자인 값 패키지 `@studyroom/design` 이다. 응답과 문서는 한국어로 쓴다.

## 값

- 값은 `src/tokens.ts` 에만 둔다. `src/mui.ts`, `src/tailwind.ts`, `scripts/postbuild.cjs` 는 그 값을 읽기만 한다.
- `src/mui.ts` 는 `@mui` 와 `react` 를 타입으로만 읽는다. MUI 의 타입 확장(`declare module`)은 이 파일 안에 둔다.
- Tailwind preset 은 값을 `theme.extend` 에만 넣는다. 글자 크기 키는 t-shirt 이름(`xs`, `2xs`, `md` 등)만 쓴다.
- 글자 크기 class 에는 굵기와 자간을 넣지 않는다. 자간은 `tracking-<단계>` 로 따로 둔다. 기존 이름에 값을 더하면 옮기지 않은 화면이 말없이 바뀐다.

## 검증

- 커밋하기 전에 `npm test` 와 `npm run build` 를 돌린다. 둘 다 통과해야 커밋한다.

## UI 작업

- 두 앱에서 UI 를 만들거나 고치기 전에 `docs/rules.md` 와 `docs/components.md` 를 읽는다.

## 릴리스

- 릴리스 파일을 같은 이름으로 다시 올리지 않는다. 값을 바꾸면 버전과 태그를 올린다.
- 릴리스 파일은 CI 의 `npm pack` 으로만 만든다. 절차는 README.md 의 릴리스 절차를 따른다.
