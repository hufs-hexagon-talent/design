# 부품 명세

두 앱은 같은 이름과 같은 모양으로 부품을 만든다. 화면은 부품만 쓴다. 부품의 겉모습은 테마와 부품이 정한다. 부품은 값을 `@studyroom/design` 의 값 객체(`colors`, `typography`, `radius`, `shadow`, `height`, `space`, `component`)에서 읽는다. 길이 값의 단위는 px 이다. 간격(`space`)은 4px 단위다. 부품 안쪽 치수(`component`)는 견본 값을 그대로 옮겨서 4px 단위가 아닌 값(22, 14, 10, 6, 2.5)도 있다. 견본에 그림이 없는 부품(SidePanel, FactList, StatusDot, ChoiceGroup 의 세그먼트)에 적은 치수와 ChoiceGroup 의 꺼진 상자 테두리 색은 아직 값 객체에 없는 시작값이다. 그 부품을 처음 만드는 PR 이 견본 캡처로 값을 확인받고, 이 저장소의 값 객체에 값을 올린 새 버전을 낸 뒤 그 값을 읽는다. 앱 코드에 이 숫자와 색을 직접 쓰지 않는다.

admin-app 은 부품을 `src/ui/` 에 파일 하나에 하나씩 둔다. 이 폴더는 admin-app 의 기반 PR(`feat/design-system-foundation`)이 만든다. user-app 은 flowbite-react 를 감싼 Button, TextInput, Modal, Table 을 `src/components/ui/` 에 둔다.

## 구현 위치

| 부품 | admin-app | user-app |
|---|---|---|
| PageHeader | `src/ui/PageHeader.tsx` | 없음 |
| Panel | `src/ui/Panel.tsx` | 없음 |
| PanelHeader | `src/ui/PanelHeader.tsx` | 없음 |
| Inset | `src/ui/Inset.tsx` | 없음 |
| Notice | `src/ui/Notice.tsx` | 없음 |
| InfoTip | `src/ui/InfoTip.tsx` | 없음 |
| Button | `src/ui/Button.tsx` | `src/components/ui/Button.jsx` |
| IconButton | `src/ui/IconButton.tsx` | 없음 |
| Dialog | `src/ui/Dialog.tsx` | `src/components/ui/Modal.jsx` |
| ConfirmDialog | `src/ui/ConfirmDialog.tsx` | `src/components/ui/Modal.jsx` |
| SidePanel | `src/ui/SidePanel.tsx` | 없음 |
| TableHead | `src/ui/TableHead.tsx` | `src/components/ui/Table.jsx` |
| TableRow | `src/ui/TableRow.tsx` | `src/components/ui/Table.jsx` |
| ListRow | `src/ui/ListRow.tsx` | 없음 |
| FactList | `src/ui/FactList.tsx` | 없음 |
| FilterTabs | `src/ui/FilterTabs.tsx` | 없음 |
| SearchField | `src/ui/SearchField.tsx` | `src/components/ui/TextInput.jsx` |
| ResultCount | `src/ui/ResultCount.tsx` | 없음 |
| EmptyState | `src/ui/EmptyState.tsx` | 없음 |
| Spinner | `src/ui/Spinner.tsx` | 없음 |
| useToast | `src/ui/useToast.tsx` | 없음 |
| StatusText | `src/ui/StatusText.tsx` | 없음 |
| StatusDot | `src/ui/StatusDot.tsx` | 없음 |
| ChoiceGroup | `src/ui/ChoiceGroup.tsx` | 없음 |
| DesktopOnlyNote | `src/ui/DesktopOnlyNote.tsx` | 없음 |
| RunLock | `src/ui/RunLock.tsx` | 없음 |

DesktopOnlyNote 와 RunLock 은 admin-app 의 `src/components/step/` 에 있던 것을 옮긴다.

## PageHeader

쓰는 자리: 화면 맨 위 제목 줄. 회원, 예약·출석, 운영, 학기, 서비스 상태, 설정, 문의 화면이 쓴다.

- 제목은 `typography.levels.title`(22/30, 700, -0.02em)이고 색은 `colors.text.primary` 다.
- 좁은 폭에서 제목은 `typography.titleNarrow`(20/28)다.
- 줄의 최소 높이는 `height.button`(36)이다. 제목 줄 아래 여백은 `space.titleGap`(24)이다.
- 제목 바로 옆에 InfoTip 을 둘 수 있다. 제목과 InfoTip 사이는 4 다.
- 조작은 오른쪽 끝에 둔다. 조작 사이는 `space.controlGap`(8)이다.
- 오른쪽 끝의 보조 글자(학과 같은 소속)는 `typography.levels.meta`(13/18)이고 색은 `colors.text.tertiary` 다. 보조 글자에 문장을 두지 않는다.
- 운영 화면의 달 이동처럼 제목에 붙는 조작은 children 으로 받는다.

## Panel

쓰는 자리: 본문의 카드. 회원 표, 명단 반영, 설정, 운영 측면 판이 쓴다.

- 면은 `colors.surface.card` 다. 선은 1px `colors.border.default` 다.
- 모서리는 `radius.card`(14)이고 그림자는 `shadow.card` 다.
- 안쪽 여백은 `space.cardPadding`(28)이다. 좁은 폭에서는 `space.cardPaddingNarrow`(16)다.
- 카드 사이는 `space.cardGap`(24)이다. 카드 안의 줄 사이는 `space.inCard`(16)다.
- 카드 안에 카드를 넣지 않는다. 안쪽 한 겹이 필요하면 Inset 을 쓴다.
- MUI Card 를 쓰면 테마가 선과 모서리를 준다. 그림자는 Card 의 기본 elevation(1)이 card 그림자로 고른다. 안쪽 여백은 Panel 이 정한다.

## PanelHeader

쓰는 자리: 카드 제목 줄과 서랍 머리.

- 제목은 `typography.levels.heading`(17/24, 700, -0.02em)이고 색은 `colors.text.primary` 다.
- 보조 글자는 `typography.levels.meta`(13/18)이고 색은 `colors.text.tertiary` 다. 보조 글자에는 출처와 소속만 쓴다.
- 카드의 조작은 오른쪽 끝에 Button 의 link 모양으로 둔다.
- 서랍 머리는 오른쪽 끝에 닫기 IconButton 을 둔다.
- 제목 줄 아래 여백은 `space.inCard`(16)다.

## Inset

쓰는 자리: 카드나 판 안의 한 겹 면. 문의 상세의 저장된 답변이 쓴다.

- 면은 `colors.surface.subtle` 이고 모서리는 `radius.control`(8)이다.
- 안쪽 여백은 위아래 12, 좌우 16 이다.
- 글자는 `typography.levels.body`(15/22), 굵기 500 이고 색은 `colors.text.primary` 다.
- 선을 두르지 않는다.
- 짙은 블록(문의 상세)은 inverse 모양이다. 면은 `colors.surface.inverse` 이고 글자는 `colors.inverse.text` 의 네 단계를 쓴다.
- Typography 의 `title`, `heading`, `meta`, `label` variant 는 밝은 면의 글자색을 함께 준다. 짙은 블록에서 이 variant 를 쓰면 글자색을 `colors.inverse.text` 로 다시 준다.
- 되돌릴 수 없는 조작의 확인 판에는 Inset 을 두지 않는다.

## Notice

쓰는 자리: 조회 실패, 조작 결과, 결과가 무거운 안내.

- 면은 `colors.surface.subtle` 이고 모서리는 `radius.control`(8)이다.
- 안쪽 여백은 `component.notice`(위아래 12, 좌우 16)다.
- 글자는 14/20(`typography.levels.control` 의 크기), 굵기 400 이고 색은 `colors.text.body` 다.
- tone 은 neutral, success, danger, warning 이다. tone 은 글자색만 `colors.status` 의 색으로 바꾼다.
- 왼쪽 색 띠, 색 바탕, 선, 아이콘을 두지 않는다.
- 닫을 수 있는 알림은 오른쪽 끝에 닫기 IconButton 을 둔다.
- 예: '휴업일은 직접 빼야 합니다.', '명단을 반영했습니다.', '반영하지 못했습니다. 다시 시도해 주세요.', '목록을 새로 받지 못했습니다. 이전 목록입니다.'

## InfoTip

쓰는 자리: 화면 제목 옆의 설명. 예: 명단 반영 화면의 '전체 재학생 명단을 올려 주세요. 일부 학생만 담긴 파일을 쓰면 나머지 계정이 만료됩니다.'

- 버튼은 i 아이콘 하나다. 크기는 `component.iconButton.size`(32), 아이콘은 `component.iconButton.iconSize`(20), 모서리는 `radius.control`(8), 색은 `colors.text.tertiary` 다.
- 설명은 마우스를 올리거나 키보드 초점을 줄 때만 보인다. 설명을 화면에 늘 펼쳐 두지 않는다.
- 설명 풍선은 MUI Tooltip 이다. 면은 `colors.surface.inverse` 이고 글자는 흰색(`colors.inverse.text.primary`)이다.
- 풍선 글자는 `typography.levels.meta`(13/18, 400)다. 안쪽 여백은 `component.tooltip`(위아래 8, 좌우 12)이고 모서리는 `radius.control`(8)이다.
- 풍선의 최대 폭은 `component.tooltip.maxWidth`(300)이고 `word-break: keep-all` 이다.
- 버튼에는 접근 이름(예: '설명')을 단다.

## Button

쓰는 자리: 모든 버튼.

- 높이는 `height.button`(36)이다. 표 안의 버튼은 `height.buttonSmall`(32), 글자 13/18, 좌우 12 다.
- 휴대폰에서 누르는 버튼은 `height.buttonTouch`(44), 글자 15/22, 좌우 22 다.
- 모서리는 `radius.control`(8)이다. 좌우 안쪽 여백은 `component.button.paddingX`(16)다.
- 글자는 14/20, 굵기 `typography.buttonWeight`(600), 자간 -0.01em 이다.
- 아이콘은 `component.button.iconSize`(18)이고 글자와 `component.button.iconGap`(6) 떨어진다. 글자 앞 아이콘은 내보내기 버튼(엑셀)에만 둔다.
- 그림자, 누를 때 물결, 떠오르는 hover 가 없다.
- 키보드 초점은 남색 테두리다. 두께는 `component.focusRing.width`(2), 버튼과의 거리는 `component.focusRing.offset`(2)이다.

모양은 역할로 고른다. 흰 글자는 `colors.inverse.text.primary` 다.

| 모양 | 기본 | hover | 꺼짐 | MUI |
|---|---|---|---|---|
| primary | 면 `colors.brand.main`, 흰 글자 | 면 `colors.brand.hover` | 면 `colors.surface.disabled`, 글자 `colors.text.disabled` | `variant="contained"` |
| secondary | 면 `colors.surface.card`, 글자 `colors.text.body`, 선 `colors.border.control` | 면 `colors.surface.subtle`, 선 `colors.border.strong` | 면 `colors.surface.card`, 글자 `colors.text.disabled`, 선 `colors.border.default` | `variant="outlined"` |
| ghost | 면 없음, 글자 `colors.text.secondary` 500, 좌우 12 | 면 `colors.surface.subtle`, 글자 `colors.text.primary` | 글자 `colors.text.disabled` | `variant="text"` |
| danger | 면 `colors.status.danger`, 흰 글자 | 바뀌지 않는다 | primary 의 꺼짐과 같다 | `variant="contained" color="error"` |
| link | 높이와 안쪽 여백 없음, 글자 13/18 500 `colors.text.tertiary` | 글자 `colors.brand.main`, 밑줄 | 글자 `colors.text.disabled` | `variant="link"` |

- 꺼진 버튼 옆에는 이유를 한 줄 둔다. 이유는 `typography.levels.meta`(13/18)이고 색은 `colors.text.tertiary` 다. 버튼은 `aria-describedby` 로 그 줄을 가리킨다. 예: '바꾸는 계정이 없습니다.'
- 진행 중에는 면과 흰 글자를 그대로 둔다. 글자 앞에 도는 표시를 두고, 글자는 조작 이름 뒤에 '중'을 붙여 바꾼다. 예: '저장 중'.
- 버튼 안의 도는 표시는 지름 `component.spinner.inlineSize`(14), 두께 `component.spinner.inlineThickness`(2)다. 호는 흰색이고 바탕은 `component.spinner.inlineTrack` 이다.
- MUI 에서는 진행 중에 `loading` 과 `loadingPosition="start"` 를 준다. 테마가 면과 흰 글자를 그대로 둔다.
- MUI 의 기본 진행 표시는 지름 16 이고 바탕 고리가 없다. 그래서 Button 부품은 `loadingIndicator` 로 Spinner 의 버튼 안 모양을 넘긴다.
- danger 는 되돌릴 수 없는 조작의 확인 판 안에만 둔다.
- 문장 속 링크는 MUI Link 다. 글자 단계는 둘레의 글자를 따르고, 색은 `colors.brand.main` 이며, 밑줄은 늘 있다. 테마가 이 모양을 준다. 카드의 13px 글자 조작은 Link 가 아니라 link 모양 버튼(`variant="link"`)으로 쓴다.
- 바깥 사이트로 가는 링크는 글자 뒤에 바깥 링크 표시를 둔다. 표시는 18 이고 글자색을 따르며, 글자와 6 떨어진다. 견본 사이드바의 '구 관리자 화면'과 서비스 상태의 UptimeRobot 링크가 쓴다.

user-app 의 Button 은 flowbite Button 을 감싸고 같은 모양을 Tailwind class 로 그린다.

| 모양 | class |
|---|---|
| primary | `h-9 rounded-lg px-4 text-sm tracking-control font-semibold bg-brand text-inverse-primary hover:bg-brand-hover` |
| secondary | `h-9 rounded-lg px-4 text-sm tracking-control font-semibold bg-card text-body border border-control hover:bg-subtle hover:border-strong` |
| ghost | `h-9 rounded-lg px-3 text-sm tracking-control font-medium text-secondary hover:bg-subtle hover:text-primary` |
| danger | `h-9 rounded-lg px-4 text-sm tracking-control font-semibold bg-danger text-inverse-primary` |
| link | `text-xs font-medium text-tertiary hover:text-brand hover:underline` |
| 꺼짐 | primary, danger 는 `disabled:bg-disabled disabled:text-disabled`. secondary 는 `disabled:bg-card disabled:text-disabled disabled:border-default`. ghost, link 는 `disabled:text-disabled` |
| 초점 | 모든 모양에 `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand` |

flowbite Button 의 기본 class 에는 `focus:outline-none` 이 있다. 그래서 초점 class 를 빼면 키보드 초점이 보이지 않는다. 휴대폰에서 누르는 버튼은 `min-h-11`(44)을 쓴다. `color="primary"` 는 남색이다.

## IconButton

쓰는 자리: 글자 대신 아이콘만 있는 조작. 닫기, 이전과 다음, 새로고침, 설명 i, 메뉴 열기, 검색어 지우기가 쓴다.

- 크기는 `component.iconButton.size`(32)이고 모서리는 `radius.control`(8)이다.
- 아이콘은 `component.iconButton.iconSize`(20)이고 색은 `colors.text.secondary` 다.
- 테두리 모양은 선 `colors.border.control`, 면 `colors.surface.card` 다. 운영 화면의 달 이동 화살표가 쓴다.
- 꺼지면 아이콘 색이 `colors.text.disabled` 다.
- hover 면은 `colors.surface.subtle` 이다. 견본에는 아이콘 버튼의 hover 그림이 없어서 ghost 버튼의 hover 면을 따랐다.
- 휴대폰에서 누르는 면은 `height.buttonTouch`(44)다. MUI 에서는 `size="large"` 를 준다. 아이콘은 20 그대로다.
- 테마는 크기를 최소값으로만 준다. 그래서 `sx` 로 안쪽 여백을 주면 누르는 면이 그만큼 커진다.
- 접근 이름(`aria-label`)을 꼭 단다.

## Dialog

쓰는 자리: 판 전부. 상태 변경, 회원 수정, 학생 등록, 예약 내보내기, 문의 처리가 쓴다.

- 폭은 `component.dialog.width`(462)다. 폭은 Dialog 부품이 정한다. 테마는 폭을 정하지 않는다.
- 면은 `colors.surface.card` 이고 모서리는 `radius.card`(14), 그림자는 `shadow.overlay` 다.
- 뒤의 가림막은 `colors.overlay` 다.
- 안쪽 여백은 `component.dialog.padding`(24)이다. 제목과 본문 사이는 `component.dialog.textGap`(8)이다.
- 제목은 `typography.levels.heading`(17/24, 700)이고 색은 `colors.text.primary` 다.
- 본문 한 줄은 `typography.levels.body`(15/22)이고 색은 `colors.text.secondary` 다.
- 버튼 줄은 오른쪽에 붙인다. 버튼 사이는 `space.controlGap`(8)이고 버튼 줄의 안쪽 여백은 24 다.
- 버튼 위 선, 위 색 띠, 닫기 아이콘을 두지 않는다.
- 진행 중에는 Esc, 가림막 누름, 취소로 판이 닫히지 않는다. 판을 닫는 처리(onClose) 한 곳에서 막는다.
- MUI 의 Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions 를 쓰면 테마가 모서리, 그림자, 가림막, 제목, 한 줄, 버튼 줄의 값을 준다.
- 화면을 채우는 판(`fullScreen`)에는 테마가 모서리를 주지 않는다.

## ConfirmDialog

쓰는 자리: 되돌릴 수 없는 조작 전부. 명단 반영, 운영 되돌리기, 학기 생성 되돌리기가 쓴다.

여는 곳

- 미리보기가 보이는 자리(카드, 오른쪽 판)의 primary 버튼이 이 판을 연다.
- 붉은 버튼은 이 판 안에만 둔다.

모양

- Dialog 와 같은 판이다. 폭 462, 안쪽 24, 제목과 한 줄 사이 8 이다.
- 제목은 조작 이름이다. 예: '명단 반영'.
- 제목 아래 한 줄은 '되돌릴 수 없습니다.' 다. 되돌리기를 확인하는 판은 '다시 되돌릴 수 없습니다.' 다.
- 한 줄의 문장은 부품이 정한다. 기본은 '되돌릴 수 없습니다.' 이고, 되돌리기 판은 속성 하나로 '다시 되돌릴 수 없습니다.' 를 고른다.
- 버튼은 [취소] 와 붉은 조작 버튼 둘이다. 취소는 secondary 모양이다. 조작 버튼은 danger 모양이고 글자는 짧은 조작 이름이다. 예: '반영', '되돌리기'.
- 조작 버튼의 최소 폭은 `component.dialog.actionMinWidth`(96)다. 그래서 진행 중과 꺼짐에서도 두 버튼 자리가 그대로다.
- 붉은 것은 조작 버튼 하나다.
- 대상 상자, 결과 문장, 운영 문장, 복구 문장, 위 색 띠, 버튼 위 선, 닫기 아이콘을 두지 않는다.
- 뒤 화면(카드와 머리)에 이미 보이는 대상과 수를 판에 다시 적지 않는다.
- 복구 방법처럼 꼭 필요한 설명은 화면 제목 옆 InfoTip 에 둔다.
- 판은 `role="alertdialog"` 다. 판은 `aria-labelledby` 로 제목을, `aria-describedby` 로 한 줄을 가리킨다.

열고 닫기

- 판이 열리면 초점은 취소에 있다.
- Enter 를 연달아 눌러도 조작이 일어나지 않는다.
- Esc 와 가림막 누름은 취소와 같다.
- 열릴 때의 초점, Enter 연타, Esc 는 부품 테스트로 지킨다.
- 판은 화면 가운데에 선다.

진행 중

- 판에 `aria-busy` 를 단다.
- 취소는 꺼진 secondary 모양(면 `colors.surface.card`, 글자 `colors.text.disabled`, 선 `colors.border.default`)이 된다.
- Esc, 가림막, 취소로 판이 닫히지 않는다.
- 조작 버튼은 같은 96 폭에서 도는 표시와, 조작 이름 뒤에 '중'을 붙인 글자를 보인다. 예: '반영 중'.
- 뒤 화면의 조작도 꺼진다. RunLock 이 앱 안 이동을 막는다.
- 끝나면 판이 닫히고, 화면의 Notice 가 결과를 말한다. 판 안에는 오류를 적지 않는다.

막힘

- 판이 열린 동안 조작할 수 없게 되면 판은 닫히지 않는다. 한 줄 자리만 이유 문장으로 바뀐다.
- 조작 버튼은 같은 폭의 꺼진 모양(면 `colors.surface.disabled`, 글자 `colors.text.disabled`)이 된다.
- 조작 버튼은 `aria-describedby` 로 그 줄을 가리킨다. 그 줄은 `aria-live="polite"` 라서 바뀌면 읽힌다.
- 조작 버튼을 누르는 순간에도 조건을 다시 확인한다. 막혔으면 요청을 보내지 않고 같은 막힘으로 바꾼다.
- 판이 열린 동안 뒤 카드의 이유 줄은 그리지 않는다. 같은 문장이 가림막 앞뒤에 두 번 서지 않게 한다.
- 다시 확인하는 버튼은 판에 두지 않는다. 취소로 닫고 화면의 새로고침을 누른다.
- 이유는 사실 문장만 쓴다. 예: '확인한 지 10분이 지났습니다.', '학과가 바뀌었습니다.', '학과를 확인하지 못했습니다.', '등록된 학과가 없습니다.', '학과가 둘 이상입니다.', '확인한 뒤 계정이 바뀌었습니다.'

미리보기 자리가 없는 되돌리기

- 학기 생성 되돌리기(이력 행)는 판을 열 때 미리보기를 받는다.
- 받는 동안 한 줄 자리에 Spinner 고리와 '조회 중'을 두고, 붉은 버튼은 꺼진다.
- 예약이 되돌리기를 막으면 한 줄 자리에 '운영 시간 밖에 남는 예약이 있습니다.' 를 둔다. 그 바로 아래에 두 줄 행을 늘어놓는다.
- 행의 윗줄은 날짜, 시간, 호실이고 14/20 `colors.text.primary` 다. 아랫줄은 학생 이름과 학번이고 13/18 `colors.text.tertiary` 다. 행 사이 선은 `colors.border.subtle` 이다.
- 표 머리, 상태 열, 개수 제목, 상자는 두지 않는다. 행은 글자만이다.
- 다섯 줄을 넘으면 목록만 판 안에서 굴린다.
- 판 위에 회원 서랍을 겹쳐 열지 않는다.
- 다시 확인하려면 판을 닫고 다시 연다. 판을 열 때마다 미리보기를 새로 받으므로 판 안에 새로고침을 두지 않는다.

운영 되돌리기

- 오른쪽 되돌리기 판이 미리보기다. 막는 변경, 막는 예약, 다시 확인 아이콘은 그 판에만 둔다.
- 그 판의 '되돌리기' 버튼은 primary 이고 이 확인 판을 연다. 막는 것이 있으면 그 버튼이 이유 한 줄과 함께 꺼져 있다.
- 확인 판은 목록 없이 '운영 되돌리기', '다시 되돌릴 수 없습니다.', [취소] [되돌리기] 로만 선다. 진행 중 글자는 '되돌리는 중'이다.

## SidePanel

쓰는 자리: 오른쪽 서랍. 회원 서랍, 회원의 예약 목록, 학기 화면의 서랍이 쓴다.

- 머리는 PanelHeader 다. 오른쪽 끝에 닫기 IconButton 을 둔다.
- 폭은 440 이다. 안쪽 여백은 24 이고 카드 사이는 `space.inCard`(16)다.
- 서랍 머리는 상단 바에 가리지 않는다.
- 화면 위에 뜨는 서랍의 그림자는 `shadow.overlay` 다. MUI Drawer(`variant="temporary"`)를 쓰면 테마가 이 그림자를 준다.
- 견본에는 서랍 그림이 없다. 처음 만들 때 견본 캡처로 확인받는다.

## TableHead, TableRow

쓰는 자리: 회원 표, 예약·출석 하루 목록, 최근 예약, 상태 변경 판의 대상 줄.

- 열은 격자(CSS grid)로 나눈다. 열 간격은 `component.table.columnGap`(24)이고 좁은 폭에서는 `space.inlineGap`(12)이다.
- 머리와 행은 좌우로 `component.table.bleed`(10)만큼 바깥으로 물린다. 글자는 카드 안쪽 선에 맞고, hover 면은 그보다 양쪽으로 10 넓다.
- 머리 글자는 `typography.levels.label`(12/16, 600)이고 색은 `colors.text.tertiary` 다. 머리 아래 여백은 `component.table.headGap`(8)이다.
- 행 높이는 `height.row`(48)다. 보조줄이 있는 행은 `height.rowTwoLine`(56)이다.
- 행마다 위에 1px `colors.border.subtle` 선을 긋는다.
- 행 글자는 `typography.levels.body`(15/22)이고 색은 `colors.text.body` 다.
- 행을 가리키는 값(이름 등)은 `colors.text.primary`, 굵기 500 이다. 보조줄은 `typography.levels.meta`(13/18), `colors.text.tertiary` 다.
- 누를 수 있는 행은 hover 면이 `colors.surface.hover` 다. 누를 수 없는 행은 hover 면이 없다.
- 학번과 시각 같은 숫자 칸은 `font-variant-numeric: tabular-nums` 다.
- 상태 칸은 StatusText 다.
- 열 순서는 docs/rules.md 의 R1~R7 을 따른다.
- MUI Table 을 쓰면 테마가 머리 글자, 행 높이 48, 행 위 선을 준다.

user-app 의 Table 은 머리에 `text-2xs font-semibold text-tertiary pb-2` 를, 행에 `h-12 border-t border-subtle text-md tracking-body text-body` 를 쓴다.

## ListRow

쓰는 자리: 열 제목이 없는 목록. 문의 목록, 최근 변경, 서랍 안 목록, 학기 생성 되돌리기 판의 예약 목록이 쓴다.

- 줄마다 위에 1px `colors.border.subtle` 선을 긋는다.
- 한 줄 글자는 `typography.levels.body`(15/22)다.
- 두 줄일 때 윗줄은 14/20 `colors.text.primary`, 아랫줄은 13/18 `colors.text.tertiary` 다.
- 누를 수 있는 줄은 hover 면이 `colors.surface.hover` 다.
- 눌러서 상세로 가는 줄은 끝에 오른쪽 화살표(20, `colors.text.disabled`)를 둔다. 학생 앱의 문의 목록이 쓴다.
- 누를 수 있는 줄의 키보드 초점 테두리는 줄 안쪽에 긋는다. MUI ListItemButton 과 MenuItem 은 테마가 이 테두리를 준다.

## FactList

쓰는 자리: 회원 서랍의 사실 목록(학번, 이메일, 상태).

- 두 열이다. 이름 열은 96 이고 값 열은 남는 폭을 쓴다.
- 줄 사이에 1px `colors.border.subtle` 선을 긋는다. 첫 줄 위에는 선을 긋지 않는다.
- 견본에는 사실 목록 그림이 없다. 글자 단계는 처음 만들 때 견본 캡처로 확인받는다.

## FilterTabs

쓰는 자리: 표 카드 첫 줄의 필터. 회원(재학생, 만료, 관리 계정), 예약·출석, 문의가 쓴다.

- 탭 높이는 `height.tab`(44)이다. 탭 좌우 여백은 `component.tab.paddingX`(14), 탭 사이는 `component.tab.gap`(4)이다.
- 탭 글자는 14/20, 500 이고 색은 `colors.text.secondary` 다. 고른 탭은 `colors.text.primary`, 600 이다.
- 고른 탭의 밑줄은 두께 `component.tab.indicatorHeight`(2), 색 `colors.brand.main` 이다. 밑줄은 탭 양 끝에서 `component.tab.indicatorInset`(8)씩 들인다.
- 탭 줄 아래에는 1px `colors.border.subtle` 선을 긋는다.
- 탭 이름 뒤에 `component.tab.countGap`(6) 띄워 개수를 둔다. 개수 색은 `colors.text.tertiary` 이고 숫자는 `tabular-nums` 다. 개수를 굵게 하거나 색으로 칠하지 않는다.
- 탭은 하나만 고른다. 고른 탭은 주소에 남겨, 상세에 갔다 돌아와도 유지한다.
- 탭 줄 아래 여백은 `space.inCard`(16)다.
- 밑줄은 탭 사이를 미끄러지지 않고 고른 탭으로 바로 옮겨 간다.
- 키보드 초점 테두리는 탭 안쪽에 긋는다. 탭 줄이 둘레를 잘라서 바깥 테두리는 보이지 않는다.
- MUI Tabs 와 Tab 을 쓰면 테마가 높이, 글자, 밑줄, 초점 테두리를 준다.

## SearchField

쓰는 자리: 표 카드 안 탭 아래의 검색 줄.

- 높이는 `height.input`(40)이고 모서리는 `radius.control`(8)이다.
- 선은 1px `colors.border.control` 이다. hover 에서는 `colors.border.strong`, 초점에서는 `colors.brand.main` 2px 다.
- 면은 `colors.surface.card` 이고 좌우 안쪽 여백은 `component.input.paddingX`(12)다.
- 앞에 돋보기 아이콘(20, `colors.text.tertiary`)을 두고 글자와 `component.input.adornmentGap`(8) 띄운다.
- 입력 글자는 `typography.levels.body`(15/22), `colors.text.body` 다. 안내 글자(placeholder)는 `colors.text.tertiary` 다. 예: '이름 또는 학번'.
- 값이 있을 때만 끝에 지우기 IconButton 을 둔다.
- 같은 줄의 스위치와 ResultCount 사이는 `space.inlineGap`(12)이다. 검색 줄 아래 여백은 `space.inCard`(16)다.
- MUI 의 OutlinedInput 과 TextField 를 쓰면 테마가 높이 40, 선, 초점 색을 준다.

user-app 의 TextInput 은 같은 입력칸 모양이다. class 는 `h-10 rounded-lg border border-control bg-card px-3 text-md tracking-body text-body placeholder:text-tertiary hover:border-strong focus:border-brand focus:ring-1 focus:ring-brand` 다.

## ResultCount

쓰는 자리: 검색 줄 오른쪽 끝의 결과 수. 예: '412명'.

- 글자는 `typography.levels.meta`(13/18)이고 색은 `colors.text.tertiary` 다.
- 숫자는 `tabular-nums` 이고 줄을 바꾸지 않는다.
- 결과 수를 굵게, 크게, 색으로 칠하지 않는다.
- 조회 중에는 '조회 중'을 쓴다.

## EmptyState

쓰는 자리: 표와 목록이 비었을 때.

- 글자는 14/20 이고 색은 `colors.text.body` 다. 위아래 여백은 8 이다.
- 조건 한 문장만 적는다. 예: '이 날 예약이 없습니다.'
- 아이콘과 그림을 두지 않는다. user-app 의 Boo 그림은 남긴다.

## Spinner

쓰는 자리: 조회 중 표시와 버튼의 진행 중 표시.

- 고리는 지름 `component.spinner.size`(20), 두께 `component.spinner.thickness`(2.5)다.
- 고리의 바탕은 `colors.brand.subtle` 이고 도는 호는 `colors.brand.main` 이다.
- 고리 옆에 '조회 중'을 `typography.levels.meta`, `colors.text.tertiary` 로 둔다.
- 버튼 안의 표시는 Button 의 진행 중 모양을 따른다.
- 접근 이름을 단다. 예: '조회 중'.
- MUI CircularProgress 는 테마가 색(`colors.brand.main`)만 준다. 지름, 두께, 바탕 고리는 Spinner 가 정한다.

## useToast

쓰는 자리: 저장처럼 짧은 결과 알림. 예: '저장했습니다'.

- 면은 `colors.surface.inverse` 이고 글자는 흰색 14/20, 굵기 400 이다.
- 안쪽 여백은 `component.toast`(위아래 10, 좌우 16)이고 모서리는 `radius.control`(8)이다.
- 그림자는 `shadow.overlay` 다.
- 아이콘을 두지 않는다.
- 토스트 자리는 앱 안에서 한 곳이다.
- 토스트 안의 글자에 Typography variant 를 쓰면 글자색을 `colors.inverse.text` 로 다시 준다.
- MUI SnackbarContent 를 쓰면 테마는 그림자만 준다. 면, 글자, 여백, 모서리는 useToast 가 정한다.

## StatusText

쓰는 자리: 예약 상태, 회원 역할, 문의 상태, 메일 수신.

- 글자는 `typography.levels.control`(14/20, 500)이다.
- 상태는 색으로만 말한다. 출석과 재학생은 `colors.status.success`, 미출석과 차단은 `colors.status.danger`, 처리됨과 만료는 `colors.text.tertiary`, 확인 필요는 `colors.status.warning` 이다.
- 면, 선, 점, 알약 모양을 두지 않는다.

## StatusDot

쓰는 자리: 서비스 상태의 점.

- 점 색은 서비스 상태 색이다. 이 색은 admin-app 에 둔다.
- 지금 두 벌인 구현과 색 표를 하나로 합친다.
- 견본에는 점 그림이 없다. 처음 만들 때 견본 캡처로 확인받는다.

## ChoiceGroup

쓰는 자리: 예약 내보내기 판의 고르기, 운영 측면 판의 세그먼트, 상태 변경 판의 옵션 줄.

- 체크 상자와 라디오는 18 이다. 켜면 `colors.brand.main` 으로 칠한다.
- 글자는 14/20 이고 색은 `colors.text.body` 다. 상자와 글자 사이는 8 이다.
- 견본의 꺼진 상자 테두리 색(#8A9099)은 아직 값 객체에 없다. 부품을 만들 때 값으로 올릴지 정한다.
- 세그먼트와 옵션 줄 모양은 견본에 없다. 처음 만들 때 견본 캡처로 확인받는다.

## DesktopOnlyNote

쓰는 자리: 휴대폰 폭에서 데스크톱에서만 할 수 있는 조작을 알린다. 운영 화면이 쓴다.

- Notice 와 같은 면과 글자를 쓴다.

## RunLock

쓰는 자리: 오래 걸리는 조작이 끝날 때까지 앱 안 이동을 막는다. 운영 화면과 ConfirmDialog 의 진행 중에 쓴다.

- 이동을 막을 때 Dialog 모양의 판을 띄운다. 판의 버튼은 '닫기' 하나다.
- 판의 글자는 14/20 `colors.text.body` 한 줄이다.

## user-app 의 판

user-app 의 Modal 은 Dialog 와 ConfirmDialog 의 모양을 따른다.

- 판은 `bg-card rounded-2xl shadow-xl` 이다. 가림막은 `bg-overlay` 다.
- 폭은 `component.dialog.width`(462)를 값 객체나 CSS 변수(`--sr-component-dialog-width`)로 읽는다.
- 제목은 `text-lg font-bold tracking-heading text-primary`, 한 줄은 `text-md tracking-body text-secondary` 다.
- Flowbite Provider 는 쓰지 않는다. Provider 는 localStorage 에 값을 쓰고 `<html>` 의 dark class 를 바꾼다.
