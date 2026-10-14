// admin-app 이 쓰는 모양 그대로 빌드한 dist 를 읽는다. npm run test:types 가 tsc --noEmit 으로 검사한다.
// 타입 확장이 dist/esm/mui.d.ts 에 실려 있지 않으면 아래 줄들이 오류가 나고, @ts-expect-error 줄은 오류가 나야 통과한다.
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { ThemeProvider, createTheme, type CSSObject, type ThemeOptions } from '@mui/material/styles';
import { colors, typography } from '@studyroom/design';
import { muiThemeOptions } from '@studyroom/design/mui';

const theme = createTheme(muiThemeOptions);

// README 의 예: 앱 설정을 ThemeOptions 로 선언하고, paper 콜백이 공용 값을 함께 돌려준다.
// 화면을 채우는 판(fullScreen)에는 앱 값도 공용 값도 주지 않는다.
const sharedPaper = muiThemeOptions.components?.MuiDialog?.styleOverrides?.paper as CSSObject;
const appOptions: ThemeOptions = {
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: ({ ownerState, theme: t }) =>
          ownerState.fullScreen ? {} : { ...sharedPaper, [t.breakpoints.down('sm')]: { margin: 16 } },
      },
    },
  },
};
export const appTheme = createTheme(muiThemeOptions, appOptions);

export const brandSubtle: string = theme.palette.brand.subtle;
export const surfacePage: string = theme.palette.surface.page;
export const borderControl: string = theme.palette.border.control;
export const inverseBody: string = theme.palette.inverse.text.body;
export const textBody: string = theme.palette.text.body;
export const textTertiary: string = theme.palette.text.tertiary;
export const titleStyle = theme.typography.title;
export const sameBrand: boolean = theme.palette.primary.main === colors.brand.main;
export const bodySize: string = typography.levels.body.fontSize;

// @ts-expect-error palette.brand 에 없는 키
export const missingKey = theme.palette.brand.unknown;

export function Probe() {
  return (
    <ThemeProvider theme={theme}>
      <Typography variant="title">회원</Typography>
      <Typography variant="heading">최근 예약</Typography>
      <Typography variant="micro">00:00</Typography>
      <Button variant="link">전체 보기</Button>
      {/* @ts-expect-error 8단계 밖의 variant 는 쓸 수 없다 */}
      <Typography variant="headline">x</Typography>
    </ThemeProvider>
  );
}
