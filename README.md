# @studyroom/design

세미나실 예약 서비스의 두 웹 앱이 함께 쓰는 디자인 값 패키지다. admin-app(관리자 웹)과 user-app(학생 웹)은 색, 글자, 간격, 모서리, 그림자, 높이를 이 패키지에서 읽는다. 부품은 앱마다 따로 만든다. 부품의 이름과 모양은 docs/components.md 를 따른다.

## 들어 있는 것

| 가져오는 경로 | 내용 | 쓰는 앱 |
|---|---|---|
| `@studyroom/design` | 값 객체(`colors`, `typography`, `radius`, `shadow`, `height`, `space`, `component`, `tokens`) | 두 앱 |
| `@studyroom/design/mui` | MUI `ThemeOptions`(`muiThemeOptions`)와 palette, Typography variant 의 타입 확장 | admin-app(MUI 9), user-app(MUI 7) |
| `@studyroom/design/tailwind` | Tailwind 3 preset | user-app |
| `@studyroom/design/tokens.css` | CSS 변수(`--sr-*`) | 두 앱 |

값은 `src/tokens.ts` 한 곳에만 있다. MUI 테마, Tailwind preset, `tokens.css` 는 모두 이 값을 읽어서 만든다.

화면 규칙은 docs/rules.md 에 있다. 부품 명세는 docs/components.md 에 있다. 두 앱에서 UI 를 만들기 전에 두 문서를 읽는다.

두 문서는 패키지 파일에도 들어 있다. 그래서 앱은 설치한 버전의 문서를 `node_modules/@studyroom/design/docs/` 에서 읽을 수 있다.

## 설치

두 앱은 GitHub Release 에 올린 파일을 주소로 받는다. 주소에는 태그와 버전이 들어간다.

```
https://github.com/hufs-hexagon-talent/design/releases/download/v0.2.1/studyroom-design-0.2.1.tgz
```

admin-app(yarn 4):

```sh
yarn add @studyroom/design@https://github.com/hufs-hexagon-talent/design/releases/download/v0.2.1/studyroom-design-0.2.1.tgz
```

user-app(yarn 1):

```sh
yarn add @studyroom/design@https://github.com/hufs-hexagon-talent/design/releases/download/v0.2.1/studyroom-design-0.2.1.tgz
```

두 명령은 `package.json` 과 `yarn.lock` 을 함께 바꾼다. 두 파일을 같은 PR 에 넣는다. Docker 빌드의 설치 명령은 lock 이 고정한 주소와 해시를 확인해야 한다. admin-app 의 Dockerfile 은 이미 `yarn install --immutable` 을 쓴다. user-app 의 Dockerfile 은 지금 `yarn install` 을 쓴다. 그래서 user-app 에 패키지를 더하는 PR 에서 `yarn install --frozen-lockfile` 로 바꾼다.

저장소는 공개로 둔다. 두 앱의 Docker 빌드는 인증 없이 이 주소에서 파일을 받는다.

## admin-app 에서 쓰기

테마는 `muiThemeOptions` 로 만든다.

```ts
// src/theme.ts
import { createTheme } from '@mui/material/styles';
import { muiThemeOptions } from '@studyroom/design/mui';

const theme = createTheme(muiThemeOptions);
export default theme;
```

앱에만 필요한 설정은 `ThemeOptions` 로 선언한 객체에 두고 두 번째 인자로 넘긴다. `createTheme` 의 두 번째 인자부터는 타입이 `object` 다. 객체에 타입을 선언하지 않으면 콜백의 인자가 `any` 가 된다.

```ts
import { createTheme, type CSSObject, type ThemeOptions } from '@mui/material/styles';
import { muiThemeOptions } from '@studyroom/design/mui';

// muiThemeOptions 는 판의 paper 를 객체로 정한다. 앱이 같은 자리에 둔 콜백은 그 객체를 대신한다.
// 그래서 콜백이 공용 값을 함께 돌려준다. 화면을 채우는 판(fullScreen)에는 둘 다 주지 않는다.
const sharedPaper = muiThemeOptions.components?.MuiDialog?.styleOverrides?.paper as CSSObject;

const appOptions: ThemeOptions = {
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: ({ ownerState, theme }) =>
          ownerState.fullScreen
            ? {}
            : {
                ...sharedPaper,
                [theme.breakpoints.down('sm')]: { margin: 16 },
              },
      },
    },
  },
};

const theme = createTheme(muiThemeOptions, appOptions);
```

`createTheme` 은 객체와 객체만 합친다. 객체와 콜백이 만나면 뒤의 것이 앞의 것을 대신한다.

`createTheme` 은 두 번째 인자를 다 만든 테마 위에 덮는다. 그래서 두 번째 인자로 준 palette 와 typography 값은 그 값 하나만 바뀐다. `palette.primary.main` 을 바꿔도 `dark` 와 `light` 는 패키지 값으로 남는다. `typography.fontFamily` 를 바꿔도 `body1` 과 글자 단계 variant 는 패키지 글꼴로 남는다. 색과 글꼴은 이 저장소의 `src/tokens.ts` 에서 바꾼다. `palette.background.default` 처럼 다른 값이 따라오지 않는 값은 두 번째 인자로 바꿔도 된다.

CSS 변수는 진입 파일에서 한 번 읽는다.

```ts
// src/main.tsx
import '@studyroom/design/tokens.css';
```

### 테마가 정하는 값

- palette: `primary` 는 주 색이다(main `#002D56`, dark 는 brand.hover, light 는 brand.subtle). `error` 는 status.danger 다. `text` 는 다섯 단계다. `background.default` 는 바닥 색, `background.paper` 는 카드 색이다. `divider` 는 border.default 다. 이 밖에 `palette.brand`, `palette.surface`, `palette.border`, `palette.inverse` 를 더했다.
- typography: 글자 8단계를 variant 로 더했다(`title`, `heading`, `prose`, `body`, `control`, `meta`, `label`, `micro`). `<Typography variant="title">` 은 `h1` 요소로 그린다. `heading` 은 `h2` 요소로 그린다. MUI 기본 variant(`h1`~`h6`, `body1` 등)는 옛 화면이 쓰므로 그대로 둔다. `button` 은 14/20, 굵기 600 이고 대문자로 바꾸지 않는다.
- 바탕: `CssBaseline` 이 body 에 body 단계 글자(15/22)와 `word-break: keep-all` 을 건다. body 의 바탕색은 `palette.background.default` 다. 기본값은 바닥 색이다. 앱이 그 값을 흰색으로 바꾸면 body 도 흰색이 된다. 앱 뿌리의 `<CssBaseline />` 을 그대로 둔다.
- spacing 과 breakpoint 는 MUI 기본값 그대로다. spacing 은 8px 이다. breakpoint md 는 900px 이다.
- 부품: 누를 때 물결(ripple)을 끈다. 버튼, 아이콘 버튼, 가림막, 툴팁, 입력칸, 탭, 표 칸, 메뉴, 스위치의 모양은 견본 값을 따른다.
- 초점: 키보드 초점은 남색 2px 테두리로 보인다. 탭, 메뉴 항목, 서랍 목록, 스위치는 부모가 둘레를 잘라서 테두리를 안쪽에 긋는다.
- hover: 버튼, 아이콘 버튼, 입력칸 선, 표 행의 hover 모양은 `@media (hover: hover)` 안에 둔다. 휴대폰 브라우저는 손가락으로 누른 요소에 hover 를 바깥을 누를 때까지 남기므로, 조건 없이 그리면 누른 버튼에 hover 면이 남는다. MUI 가 기기를 가리지 않고 칠하는 표 행의 hover 면(고른 행 포함)과, hover 가 없는 기기에서 MUI 가 자기 색으로 되돌리는 입력칸 선은 `@media (hover: none)` 에서 이 테마의 기본 모양으로 둔다. 앱이 `sx` 로 hover 를 더할 때도 `@media (hover: hover)` 안에 둔다.
- 판: Dialog 는 모서리 14 와 overlay 그림자를 받는다. 화면을 채우는 판(`fullScreen`)은 모서리를 받지 않는다. 판의 폭은 테마가 정하지 않는다. Dialog 부품이 폭 462 를 정한다.
- 링크: Link 는 문장 속 링크다. 글자 단계는 둘레의 글자를 따른다. 색은 주 색이고 밑줄은 늘 있다. 카드의 13px 글자 조작은 Link 가 아니라 Button `variant="link"` 로 쓴다.
- 고리 표시: CircularProgress 는 색만 받는다. 지름, 두께, 바탕 고리는 Spinner 부품이 정한다.
- 그림자: 테마의 `shadows` 25개는 없음, card, overlay 세 값뿐이다. elevation 0 은 그림자가 없고, 1~5 는 card, 6 이상은 overlay 다. 그래서 elevation 을 준 Paper 도 두 그림자 가운데 하나를 받는다. AppBar 는 그림자가 없다. 화면 위에 뜨는 서랍(`variant="temporary"`), 토스트(SnackbarContent), 판, 메뉴는 overlay 그림자다. Card 는 카드 모양(선 border.default, 모서리 14)이고, 그림자는 elevation 을 따른다. 기본 elevation 1 은 card 그림자이고 `elevation={0}` 은 그림자가 없다.
- Slider: 손잡이에 그림자와 주 색 고리(hover, 초점, 끌기)를 두지 않는다. 키보드 초점은 남색 2px 테두리다. 앱이 `sx` 로 준 그림자는 테마보다 뒤에 붙어 이기므로 앱 코드에서 지운다.
- 움직임: 메뉴, 팝오버, 툴팁, 토스트는 커지는 움직임 없이 바로 나타난다. 탭 밑줄은 탭 사이를 미끄러지지 않고 고른 탭으로 바로 옮겨 간다. 판과 가림막의 옅어짐, 서랍의 밀려 나옴은 MUI 기본 그대로다.
- 입력칸: 한 줄 입력칸은 높이 40 이다. `TextField` 와 `FormControl` 의 기본 크기를 small 로 두어 라벨 자리를 높이 40 에 맞춘다.
- outlined 라벨: 라벨 글자는 입력 글자와 같은 body 단계(15/22)다. 테두리의 틈(notch)은 입력 글자의 0.75배로 재고 줄어든 라벨도 0.75배라서, 둘이 같은 단계여야 테두리 선이 라벨 끝을 가로지르지 않는다. 비어 있는 라벨은 입력 글자와 같은 안쪽 여백(12)에, 높이 40 의 가운데에 선다. 줄어든 라벨은 테두리 선 위에 서고, 테두리의 틈은 라벨보다 6 앞에서 시작한다.
- 스위치: 바탕은 끄면 `component.switch.trackOff`(#B9BEC7), 켜면 `component.switch.trackOn`(#8AA3BB)이고 옅게 비치지 않는다. 켠 바탕은 `color="primary"`(기본)일 때만 정하고, 다른 color 와 쓸 수 없는 스위치(disabled)의 옅은 바탕은 MUI 기본을 따른다. 손잡이에는 윤곽(`component.switch.thumbShadow`)을 준다. 끈 손잡이는 흰색이라 윤곽이 없으면 흰 카드 위에서 사라진다. 켠 손잡이는 주 색이다. 앱이 `color` 를 주지 않고 `sx` 로 켠 바탕의 색만 덮으면 바탕은 테마의 `opacity` 1 을 그대로 받고, 덮은 색이 손잡이와 같을 때 손잡이가 바탕에 묻히므로 `opacity` 도 함께 덮는다.
- 탭 줄 선: 가로 탭 줄 아래에 1px `colors.border.subtle` 선을 긋고, 고른 탭의 밑줄(2px)이 그 선 위에 겹쳐 선을 덮는다(견본 `.tabs` 와 `.tab.on::after`). 탭 줄의 높이는 탭 44 와 선 1 을 더한 45 다. 선은 Tabs 뿌리 안쪽에 흐림 없는 그림자로 긋고, 밑줄은 scroller 아래에 둔 1px 여백 자리까지 내려 선다. 앱이 Tabs 에 `borderBottom` 을 따로 주면 선이 두 줄이 되고 밑줄이 아래 줄을 덮지 못하므로 지운다. 세로 탭에는 선이 없다.

버튼 모양은 MUI 의 variant 와 color 로 고른다.

| 모양 | MUI |
|---|---|
| primary | `variant="contained"` |
| secondary | `variant="outlined"` |
| ghost | `variant="text"` |
| danger | `variant="contained" color="error"` |
| link | `variant="link"` |

크기는 `size="small"`(32, 표 안)과 `size="large"`(44, 휴대폰)를 쓴다. primary 와 danger 버튼에 `loading` 과 `loadingPosition="start"` 를 주면 진행 중에도 면과 흰 글자가 그대로다.

아이콘 버튼은 최소 32 다. 휴대폰에서는 `size="large"` 를 주어 누르는 면을 44 로 넓힌다. 테마는 폭과 높이를 고정하지 않는다. 그래서 `sx` 로 준 안쪽 여백만큼 누르는 면이 커진다.

부품 안의 치수는 값 객체에서 읽는다.

```ts
import { component, space } from '@studyroom/design';

const dialogWidth = component.dialog.width; // '462px'
const cardGap = space.cardGap; // '24px'
```

## user-app 에서 쓰기

`tailwind.config.js` 에 preset 을 더한다. 지금처럼 `theme.colors` 를 통째로 바꾸는 짜임은 그대로 둔다. preset 은 값을 모두 `theme.extend` 에 넣으므로 앱 설정과 부딪히지 않는다.

```js
// tailwind.config.js
const flowbite = require('flowbite-react/tailwind');

module.exports = {
  presets: [require('@studyroom/design/tailwind')],
  content: ['./src/**/*.{js,jsx,ts,tsx}', flowbite.content()],
  theme: {
    extend: {},
    colors: {
      // 앱 고유 색
    },
  },
  plugins: [flowbite.plugin()],
};
```

CSS 변수는 진입 파일에서 읽는다.

```js
// src/index.js
import '@studyroom/design/tokens.css';
```

preset 은 기본 스타일을 넣지 않는다. 낱말 중간에서 줄을 바꾸지 않도록 `src/index.css` 의 body 에 `word-break: keep-all` 을 직접 건다.

```css
/* src/index.css */
body {
  word-break: keep-all;
  overflow-wrap: anywhere;
}
```

지금 `src/index.css` 의 `*` 규칙은 모든 요소에 글꼴을 따로 정한다. 이 글꼴 줄은 preset 의 기본 글꼴(`fontFamily.sans`)을 덮는다. 그래서 preset 을 더할 때 그 줄을 지운다.

### preset 이 만드는 class

| 종류 | class |
|---|---|
| 글자 크기 | `text-2xl`(title 22/30), `text-lg`(heading 17/24), `text-base`(prose 16/26), `text-md`(body 15/22), `text-sm`(control 14/20), `text-xs`(meta 13/18), `text-2xs`(label 12/16), `text-3xs`(micro 11/14) |
| 자간 | `tracking-title`(-0.02em), `tracking-heading`(-0.02em), `tracking-prose`(-0.01em), `tracking-body`(-0.01em), `tracking-control`(-0.01em) |
| 주 색과 상태 | `bg-brand`, `bg-brand-hover`, `bg-brand-subtle`, `text-brand`, `text-success`, `text-danger`, `text-warning`, `bg-danger` |
| 글자색 | `text-primary`, `text-body`, `text-secondary`, `text-tertiary`, `text-disabled` |
| inverse 면 위의 글자색 | `text-inverse-primary`, `text-inverse-body`, `text-inverse-secondary`, `text-inverse-tertiary` |
| 면 | `bg-page`, `bg-card`, `bg-subtle`, `bg-hover`, `bg-selected`, `bg-disabled`, `bg-inverse`, `bg-overlay`(가림막) |
| 선 | `border`(border.default), `border-default`, `border-subtle`, `border-control`, `border-strong` |
| 초점 고리 사이 색 | `ring-offset-inverse` |
| 모서리, 그림자, 글꼴 | `rounded-lg`(8), `rounded-2xl`(14), `shadow-sm`(카드), `shadow-xl`(판), `font-sans` |

- preset 은 Tailwind 기존 이름의 값도 덮는다. 글자 크기(`text-xs`, `text-sm`, `text-base`, `text-lg`, `text-2xl`), 모서리(`rounded-lg`, `rounded-2xl` 은 16 에서 14 로), 그림자(`shadow-sm`, `shadow-xl`), 기본 선 색(`border` 와 preflight 의 선 색), 기본 글꼴(`font-sans` 와 `html` 의 글꼴)이 여기에 든다. 그래서 preset 을 더하면 아직 옮기지 않은 화면과 flowbite 부품도 바뀐다.
- preset 은 Tailwind 의 `future.hoverOnlyWhenSupported` 를 켠다. `hover:` 계열 class 는 마우스처럼 hover 가 되는 기기(`(hover: hover) and (pointer: fine)`)에서만 걸린다. 이것도 옮기지 않은 화면과 flowbite 부품에 걸린다. 마우스로 보는 모양은 같고, 휴대폰에서 누른 뒤 남던 hover 모양이 사라진다. Tailwind 는 preset 의 `future` 를 키 단위로 합치므로 앱 설정에 `future` 를 두면 preset 의 값이 빠진다. 그때는 앱의 `future` 에 `hoverOnlyWhenSupported: true` 를 함께 적는다.
- 옛 관리자 화면 다섯 곳(`/manage/facility/room`, `/manage/facility/room/:roomId`, `/manage/facility/partition`, `/manage/user-state`, `/manage/banner/manage`)은 지금도 `text-md` 를 쓴다. 지금은 Tailwind 에 그 이름이 없어서 이 class 가 아무 크기도 주지 않는다. preset 을 더하면 그 자리의 글자가 15/22 가 된다. 그래서 preset 을 처음 더하는 PR 의 전후 캡처에 이 화면들도 넣는다.
- 글자 크기 class 는 굵기와 자간을 바꾸지 않는다. 굵기는 `font-semibold` 같은 class 로 따로 준다. 자간이 있는 단계는 `tracking-<단계>` 를 함께 준다. 예: `text-2xl tracking-title`, `text-md tracking-body`.
- 글자 크기 이름은 t-shirt 이름만 쓴다. flowbite-react 는 class 를 합칠 때 tailwind-merge 2.2.2 를 쓴다. tailwind-merge 2.2.2 는 다른 이름(`text-meta` 등)을 글자색으로 읽는다. 그러면 같은 요소에 준 글자색 class 가 지워진다. `tracking-<단계>` 는 tailwind-merge 2.2.2 가 모르는 이름이라 그대로 남는다.
- preset 에 없는 값은 CSS 변수로 쓴다. 예: `width: var(--sr-component-dialog-width)`.

CSS 파일의 hex 는 CSS 변수로 바꾼다.

```css
.usage-card {
  color: var(--sr-color-text-tertiary);
  border-radius: var(--sr-radius-card);
}
```

### 바닥글

견본의 바닥글은 inverse 면에 inverse.text.secondary 글자를 쓴다. 굵은 이름표는 inverse.text.body 다. 바닥글의 앱 고유 색 class 는 preset class 로 바꾼다.

| 지금 class | 바꿀 class |
|---|---|
| `bg-footermainbg` | `bg-inverse` |
| `text-footertextcolor` | `text-inverse-secondary` |
| `text-footertextbrown`(굵은 이름표) | `text-inverse-body` |
| `focus-visible:ring-offset-footermainbg` | `focus-visible:ring-offset-inverse` |

링크의 hover 색(`hover:text-footertextbrown`)은 견본에 없다. 이 색은 견본 캡처로 담당자 확인을 받은 뒤 정한다. 바꾼 뒤 class 로 쓰는 곳이 없는 바닥글 색은 `theme.colors` 에서 지운다.

user-app 의 MUI(7)도 같은 테마를 쓸 수 있다. 앱 뿌리에 `ThemeProvider` 를 두고 `createTheme(muiThemeOptions)` 를 넘긴다.

## CSS 변수 이름

이름은 `--sr-<묶음>-<경로>` 다. 경로 끝의 `main` 은 뺀다.

| 값 | 변수 |
|---|---|
| `colors.brand.main` | `--sr-color-brand` |
| `colors.text.tertiary` | `--sr-color-text-tertiary` |
| `colors.status.danger` | `--sr-color-status-danger` |
| `typography.levels.meta.fontSize` | `--sr-font-meta-size` |
| `radius.card` | `--sr-radius-card` |
| `shadow.overlay` | `--sr-shadow-overlay` |
| `height.rowTwoLine` | `--sr-height-row-two-line` |
| `component.dialog.width` | `--sr-component-dialog-width` |

## 값을 바꾸는 법

1. `src/tokens.ts` 의 값을 고친다.
2. `npm test` 를 돌린다. 대비 검사가 읽는 글자의 4.5:1 을 확인한다.
3. 두 앱의 화면 캡처로 담당자 확인을 받는다.
4. 릴리스 절차대로 새 버전을 낸다.

## 릴리스 절차

1. PR 에서 `package.json` 의 `version` 을 올린다. 예: `npm version 0.2.2 --no-git-tag-version`.
2. PR 을 main 에 병합한다.
3. 원격 main 의 병합 커밋에 태그 `vX.Y.Z` 를 달고 그 태그만 push 한다. 예: `git fetch origin && git tag v0.2.2 origin/main && git push origin v0.2.2`.
4. CI(`.github/workflows/release.yml`)가 태그와 `version` 이 같은지 확인한다. CI 는 태그 커밋이 main 에 있는지도 확인한다. 이어서 `npm ci`, `npm test`, `npm pack` 을 돌리고 GitHub Release 를 만들어 tgz 를 올린다. Release 설명에는 tgz 의 sha1 과 sha512 가 들어간다.
5. 두 앱의 의존성 주소를 새 태그로 바꾸고 `yarn.lock` 을 함께 갱신한다. user-app 의 lock 은 주소 끝에 `#sha1` 을 적는다. 그 값이 Release 설명의 sha1 과 같은지 확인한다.

## 지키는 규칙

- 릴리스 파일을 같은 이름으로 다시 올리지 않는다. 두 앱의 lock 이 그 파일의 해시를 고정한다. 내용이 바뀐 파일을 같은 주소에 두면 캐시가 없는 빌드는 실패한다. 캐시가 있는 PC 는 옛 내용을 경고 없이 쓴다. 값을 바꾸면 버전, 태그, 주소를 함께 올린다. release.yml 은 이미 있는 Release 에 파일을 덮어쓰지 않는다.
- release.yml 만으로는 Release 를 지우고 같은 태그로 다시 만드는 일을 막지 못한다. 그래서 GitHub 저장소를 만들 때 Settings 의 General 에서 Releases 의 release immutability 를 켠다. 이 설정은 낸 Release 의 파일과 태그를 바꾸지 못하게 한다.
- 같은 때에 `v*` 태그 ruleset 을 두어 태그의 삭제와 갱신을 막는다.
- 릴리스 파일은 CI 의 `npm pack` 으로만 만든다. macOS 의 `tar` 로 직접 묶은 파일에서 yarn 1 이 설치 도중 멈췄다.
- `peerDependencies` 의 MUI 범위는 테스트가 확인하는 메이저(7, 9)까지다(`>=7 <10`). 새 메이저는 테스트를 더한 뒤 넓힌다.
- 빌드한 `dist` 를 패키지에 담는다. yarn 4 는 기본으로 설치 스크립트를 돌리지 않는다. 그래서 설치하는 쪽에서는 빌드할 수 없다. `prepack` 이 `npm pack` 전에 빌드한다.

## 개발

Node 22 와 npm 을 쓴다. CI 도 Node 22 를 쓴다.

```sh
npm ci
npm test        # 빌드한 뒤 vitest 와 타입 검사를 돌린다
npm run build   # dist 와 tokens.css 를 만든다
npm pack --dry-run
```

태그 전에 `npm pack` 결과를 두 앱의 사본에 설치해 확인한다. 같은 0.2.1 을 다시 빌드해 같은 경로로 `yarn add` 하면 yarn 1 은 경고 없이 옛 내용을 설치한다. yarn 1 은 같은 경로에 대해 전역 캐시의 옛 파일과 lock 의 옛 항목을 그대로 쓴다. 새 캐시 폴더(`YARN_CACHE_FOLDER`)를 주어도 lock 에 옛 항목이 있으면 옛 내용이 들어간다. 그래서 user-app 사본에는 빌드마다 파일 이름을 바꿔 설치한다.

```sh
sha="$(shasum -a 1 studyroom-design-0.2.1.tgz | cut -c1-8)"
cp studyroom-design-0.2.1.tgz "vendor/studyroom-design-0.2.1-$sha.tgz"
yarn add "@studyroom/design@file:./vendor/studyroom-design-0.2.1-$sha.tgz"
grep -A 2 '^"@studyroom/design@' yarn.lock
```

설치한 뒤 `yarn.lock` 의 `resolved` 끝 `#sha1` 이 `$sha` 로 시작하는지 확인한다. admin-app 의 yarn 4 는 tgz 내용이 바뀌면 lock 의 `hash=` 값을 바꾼다. 그래서 같은 경로로 다시 `yarn add` 해도 새 내용이 들어간다.

### npm test 가 확인하는 것

- 대비: 읽는 글자 토큰이 놓이는 면에서 4.5:1 이상이다. 면은 card, subtle, page, hover, selected 다. 흰 글자는 주 색, 위험, 성공, 경고 면 위에서 잰다. inverse 글자는 inverse 면 위에서 잰다.
- `tokens.css`: 모든 토큰 값이 정해진 이름의 변수로 들어 있다.
- MUI: `createTheme(muiThemeOptions)` 가 MUI 9 와 MUI 7 에서 모두 테마를 만든다. 두 버전에서 부품을 서버 렌더하고 높이, 모서리, 글자 크기, 그림자를 확인한다. 아이콘 버튼의 최소 크기와 `size="large"` 의 44, 화면을 채우는 판의 모서리, body 바탕색, 안쪽 초점 테두리, 탭 밑줄의 움직임 없음, elevation 그림자가 두 값뿐인 것, Slider 손잡이에 색 고리가 없는 것, 스위치의 바탕 두 색과 손잡이 윤곽, outlined 라벨의 글자 단계와 자리, 고른 탭의 밑줄이 탭 줄 아래 선을 덮는 것도 확인한다. Slider, 스위치, outlined 라벨은 MUI 기본 테마를, 탭 줄은 0.1.0 의 짜임(뿌리의 border 로 그은 선)을 대조군으로 함께 잰다. 브라우저 환경(jsdom)에서는 버튼을 눌러도 물결이 생기지 않는지, 키보드 초점을 받은 탭의 테두리, 툴팁과 토스트가 바로 나타나는지를 확인한다.
- hover: 테마 객체를 걸어 다니며, 조건 없는 `:hover` 가 그림자를 지우는 것 말고 색을 바꾸지 않는지 확인한다. `@media (hover: none)` 의 hover 규칙은 되돌리는 자리마다 테스트에 적어 둔 누르기 전 값(투명, 입력칸의 기본 선, MUI 가 고른 행에 칠하는 면)으로만 되돌려야 한다. 걷는 범위는 부품마다 styleOverrides, variants, defaultProps.sx 이고, 선택자는 대소문자를 가리지 않고 본다. 서버 렌더한 CSS 에서는 같은 선택자의 규칙을 MUI 의 것과 함께 문서 순서로 읽어, 기기마다 걸리는 hover 값(그 기기에 맞는 마지막 값)을 확인한다.
- Tailwind: user-app 과 같은 짜임(`theme.colors` 를 바꾼 설정)으로 Tailwind 3.4 를 돌려 class 마다 값을 확인한다. preset 의 `future` 가 앱 설정에 합쳐져 `hover:` class 가 hover 조건 안에 서는지도 본다.
- tailwind-merge 2.2.2: 글자 크기 class 와 글자색 class 를 함께 두어도 둘 다 남는다. `tracking-<단계>` 도 함께 남는다.
- 타입: `test/types/consumer.tsx` 를 MUI 9 타입으로 검사한다. `variant="title"` 과 `palette.brand` 가 통과하고, 없는 variant 는 오류가 나야 한다.
- 패키지: exports, Jest 27 용 하위 폴더(`mui/`, `tailwind/`), 루트 `tokens.css` 로 각 진입점을 찾는다. 산출 JS 에는 `@mui` 와 `react` 의 import 가 없다. 패키지 파일에 `docs` 가 들어간다.

의존성을 새로 풀 때 npm 10 의 `npm install` 이 `Cannot read properties of null (reading 'edgesOut')` 로 멈출 수 있다. 그때는 npm 11 로 lock 을 만든 뒤 Node 22 에서 `npm ci` 와 `npm test` 로 확인한다.
