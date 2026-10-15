// MUI ThemeOptions. 앱에서 createTheme(muiThemeOptions) 로 테마를 만든다.
// @mui 와 react 는 타입으로만 읽는다. 그래서 산출 JS 에는 두 패키지의 import 가 남지 않는다.
// MUI 7(user-app)과 MUI 9(admin-app)에 모두 있는 모양만 쓴다: styleOverrides 의 variants 배열과 콜백.
// 타입 확장(declare module)은 이 파일 안에 둔다. 별도 .d.ts 파일에 두면 tsc 가 dist 로 옮기지 않는다.
// 값은 모두 tokens.ts 에서 읽는다. 이 파일에는 0, none, transparent 같은 구조 값과 1px 선 두께만 둔다.
import type { CSSProperties } from 'react';
import type { Shadows, ThemeOptions } from '@mui/material/styles';
import {
  colors,
  component,
  height,
  radius,
  shadow,
  space,
  typography,
  type TypographyLevelName,
} from './tokens.js';

export interface PaletteBrand {
  main: string;
  hover: string;
  subtle: string;
}

export interface PaletteSurface {
  page: string;
  card: string;
  subtle: string;
  hover: string;
  selected: string;
  disabled: string;
  inverse: string;
}

export interface PaletteBorder {
  subtle: string;
  default: string;
  control: string;
  strong: string;
}

export interface PaletteInverse {
  text: {
    primary: string;
    body: string;
    secondary: string;
    tertiary: string;
  };
}

declare module '@mui/material/styles' {
  interface Palette {
    brand: PaletteBrand;
    surface: PaletteSurface;
    border: PaletteBorder;
    inverse: PaletteInverse;
  }

  interface PaletteOptions {
    brand?: Partial<PaletteBrand>;
    surface?: Partial<PaletteSurface>;
    border?: Partial<PaletteBorder>;
    inverse?: { text?: Partial<PaletteInverse['text']> };
  }

  interface TypeText {
    body: string;
    tertiary: string;
  }

  interface TypographyVariants {
    title: CSSProperties;
    heading: CSSProperties;
    prose: CSSProperties;
    body: CSSProperties;
    control: CSSProperties;
    meta: CSSProperties;
    label: CSSProperties;
    micro: CSSProperties;
  }

  interface TypographyVariantsOptions {
    title?: CSSProperties;
    heading?: CSSProperties;
    prose?: CSSProperties;
    body?: CSSProperties;
    control?: CSSProperties;
    meta?: CSSProperties;
    label?: CSSProperties;
    micro?: CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    title: true;
    heading: true;
    prose: true;
    body: true;
    control: true;
    meta: true;
    label: true;
    micro: true;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    link: true;
  }
}

const { levels } = typography;
const onFill = colors.inverse.text.primary;
const hairline = (color: string) => `1px solid ${color}`;

/**
 * 둘레가 잘리는 자리(탭 줄, 메뉴, 서랍 목록, 스위치)의 초점 테두리.
 * 부모가 overflow 를 숨기므로 테두리를 요소 안쪽에 긋는다. 두께와 색은 MuiButtonBase 의 테두리 그대로다.
 */
const insetFocusRing = {
  '&.Mui-focusVisible': { outlineOffset: `calc(-1 * ${component.focusRing.width})` },
};

/**
 * MUI 가 elevation 으로 고르는 그림자 25개. 그림자는 카드와 판 두 가지뿐이므로 두 값으로 채운다.
 * elevation 0 은 그림자가 없고, 1~5(Paper, Card)는 카드 그림자, 6 이상(토스트 6, 메뉴 8, 서랍 16, 판 24)은 판 그림자다.
 */
const shadows = Array.from({ length: 25 }, (_, elevation) =>
  elevation === 0 ? 'none' : elevation < 6 ? shadow.card : shadow.overlay,
) as Shadows;

/** 글자 단계 하나를 MUI 스타일 객체로 바꾼다. */
const font = (name: TypographyLevelName) => ({
  fontFamily: typography.fontFamily,
  fontSize: levels[name].fontSize,
  lineHeight: levels[name].lineHeight,
  fontWeight: levels[name].fontWeight,
  letterSpacing: levels[name].letterSpacing,
});

/** 주 색·위험 버튼(.btn.primary, .btn.danger)과 꺼진 모양(.btn.off). */
const filledButton = (fill: string, hoverFill: string) => ({
  border: hairline('transparent'),
  backgroundColor: fill,
  color: onFill,
  '&:hover': { backgroundColor: hoverFill },
  '&.Mui-disabled': { backgroundColor: colors.surface.disabled, color: colors.text.disabled },
  // MUI 의 loading 은 버튼을 끈다. 진행 중에는 면과 흰 글자를 그대로 둔다(견본의 '저장 중', '반영 중').
  '&.MuiButton-loading': { backgroundColor: fill },
  '&.MuiButton-loadingPositionStart, &.MuiButton-loadingPositionEnd': { color: onFill },
});

export const muiThemeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: colors.brand.main,
      dark: colors.brand.hover,
      light: colors.brand.subtle,
      contrastText: onFill,
    },
    error: { main: colors.status.danger, contrastText: onFill },
    success: { main: colors.status.success, contrastText: onFill },
    warning: { main: colors.status.warning, contrastText: onFill },
    text: {
      primary: colors.text.primary,
      body: colors.text.body,
      secondary: colors.text.secondary,
      tertiary: colors.text.tertiary,
      disabled: colors.text.disabled,
    },
    background: { default: colors.surface.page, paper: colors.surface.card },
    divider: colors.border.default,
    brand: { ...colors.brand },
    surface: { ...colors.surface },
    border: { ...colors.border },
    inverse: { text: { ...colors.inverse.text } },
  },

  typography: {
    fontFamily: typography.fontFamily,
    // MUI 기본 variant(h1~h6, body1 등)는 옛 화면이 쓰므로 그대로 둔다. button 만 고친다.
    button: {
      fontSize: levels.control.fontSize,
      lineHeight: levels.control.lineHeight,
      fontWeight: typography.buttonWeight,
      letterSpacing: levels.control.letterSpacing,
      textTransform: 'none',
    },
    title: { ...font('title'), color: colors.text.primary },
    heading: { ...font('heading'), color: colors.text.primary },
    prose: font('prose'),
    body: font('body'),
    control: font('control'),
    meta: { ...font('meta'), color: colors.text.tertiary },
    label: { ...font('label'), color: colors.text.tertiary },
    micro: font('micro'),
  },

  shape: { borderRadius: Number.parseFloat(radius.control) },

  shadows,

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // 바탕색은 넣지 않는다. CssBaseline 이 palette.background.default 로 칠하므로 앱이 그 값을 바꾸면 body 도 따라간다.
        body: {
          color: colors.text.body,
          fontFamily: typography.fontFamily,
          fontSize: levels.body.fontSize,
          lineHeight: levels.body.lineHeight,
          wordBreak: 'keep-all',
          overflowWrap: 'anywhere',
        },
      },
    },

    MuiTypography: {
      defaultProps: {
        variantMapping: {
          title: 'h1',
          heading: 'h2',
          prose: 'p',
          body: 'p',
          control: 'span',
          meta: 'span',
          label: 'span',
          micro: 'span',
        },
      },
    },

    MuiButtonBase: {
      defaultProps: { disableRipple: true },
      styleOverrides: {
        root: {
          '&.Mui-focusVisible': {
            outline: `${component.focusRing.width} solid ${colors.brand.main}`,
            outlineOffset: component.focusRing.offset,
          },
        },
      },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          height: height.button,
          minWidth: 0,
          padding: `0 ${component.button.paddingX}`,
          gap: component.button.iconGap,
          borderRadius: radius.control,
          boxShadow: 'none',
          whiteSpace: 'nowrap',
          '&:hover, &:active, &.Mui-focusVisible, &.Mui-disabled': { boxShadow: 'none' },
          variants: [
            {
              props: { size: 'small' },
              style: {
                height: height.buttonSmall,
                padding: `0 ${component.button.paddingXSmall}`,
                fontSize: levels.meta.fontSize,
                lineHeight: levels.meta.lineHeight,
              },
            },
            {
              props: { size: 'large' },
              style: {
                height: height.buttonTouch,
                padding: `0 ${component.button.paddingXTouch}`,
                fontSize: levels.body.fontSize,
                lineHeight: levels.body.lineHeight,
              },
            },
            {
              props: { variant: 'contained', color: 'primary' },
              style: filledButton(colors.brand.main, colors.brand.hover),
            },
            {
              // 위험 버튼은 견본에 hover 값이 없어 면을 그대로 둔다.
              props: { variant: 'contained', color: 'error' },
              style: filledButton(colors.status.danger, colors.status.danger),
            },
            {
              // .btn.secondary, 꺼지면 .btn.secondary.off
              props: { variant: 'outlined', color: 'primary' },
              style: {
                border: hairline(colors.border.control),
                backgroundColor: colors.surface.card,
                color: colors.text.body,
                '&:hover': {
                  backgroundColor: colors.surface.subtle,
                  borderColor: colors.border.strong,
                },
                '&.Mui-disabled': {
                  backgroundColor: colors.surface.card,
                  color: colors.text.disabled,
                  borderColor: colors.border.default,
                },
              },
            },
            {
              // .btn.ghost. 글자만 있는 버튼이라 꺼지면 글자색만 바뀐다.
              props: { variant: 'text', color: 'primary' },
              style: {
                border: hairline('transparent'),
                color: colors.text.secondary,
                fontWeight: levels.control.fontWeight,
                '&:hover': {
                  backgroundColor: colors.surface.subtle,
                  color: colors.text.primary,
                },
                '&.Mui-disabled': { color: colors.text.disabled },
              },
            },
            {
              props: { variant: 'text', color: 'primary', size: 'medium' },
              style: { padding: `0 ${component.button.paddingXGhost}` },
            },
            {
              // .btn.link: 13px 글자 버튼. 크기 variant 보다 뒤에 두어 높이와 여백을 없앤다.
              props: { variant: 'link' },
              style: {
                height: 'auto',
                padding: 0,
                border: 0,
                backgroundColor: 'transparent',
                fontSize: levels.meta.fontSize,
                lineHeight: levels.meta.lineHeight,
                fontWeight: levels.control.fontWeight,
                color: colors.text.tertiary,
                verticalAlign: 'baseline',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: colors.brand.main,
                  textDecoration: 'underline',
                },
                '&.Mui-disabled': { color: colors.text.disabled },
              },
            },
            {
              // 가운데 loading 은 MUI 가 글자를 투명하게 숨긴다. 위의 꺼진 글자색이 그것을 덮지 않게 한다.
              props: {},
              style: { '&.MuiButton-loadingPositionCenter': { color: 'transparent' } },
            },
          ],
        },
        startIcon: {
          margin: 0,
          '& > *:nth-of-type(1)': { fontSize: component.button.iconSize },
        },
        endIcon: {
          margin: 0,
          '& > *:nth-of-type(1)': { fontSize: component.button.iconSize },
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          // 폭과 높이를 고정하지 않고 최소값만 둔다. 앱이 sx 로 안쪽 여백을 주면 누르는 면이 그만큼 커진다.
          minWidth: component.iconButton.size,
          minHeight: component.iconButton.size,
          padding: 0,
          border: hairline('transparent'),
          borderRadius: radius.control,
          '& .MuiSvgIcon-root': { fontSize: component.iconButton.iconSize },
          '&.Mui-disabled': { color: colors.text.disabled },
          variants: [
            {
              // 휴대폰에서 누르는 아이콘 버튼. 아이콘 크기는 그대로 두고 누르는 면만 44 로 넓힌다.
              props: { size: 'large' },
              style: { minWidth: height.buttonTouch, minHeight: height.buttonTouch },
            },
            {
              // color="inherit"(상단 바 위의 아이콘)는 건드리지 않는다.
              props: { color: 'default' },
              style: {
                color: colors.text.secondary,
                '&:hover': { backgroundColor: colors.surface.subtle },
              },
            },
          ],
        },
      },
    },

    // 문장 속 링크. 글자 단계는 둘레의 글자를 따르고, 주 색 글자에 밑줄을 늘 둔다.
    // 카드의 13px 글자 조작(.btn.link)은 Button variant="link" 가 맡는다.
    MuiLink: {
      defaultProps: { underline: 'always' },
      styleOverrides: {
        root: { textDecorationColor: 'currentColor' },
      },
    },

    MuiBackdrop: {
      styleOverrides: {
        root: {
          // 메뉴와 팝오버의 투명한 가림막(invisible)은 그대로 둔다.
          variants: [{ props: { invisible: false }, style: { backgroundColor: colors.overlay } }],
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        // 화면을 채우는 판(fullScreen)은 MUI 기본(모서리 0)을 그대로 둔다. 판의 폭은 Dialog 부품이 정한다.
        paper: {
          variants: [
            { props: { fullScreen: false }, style: { borderRadius: radius.card, boxShadow: shadow.overlay } },
          ],
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          ...font('heading'),
          color: colors.text.primary,
          padding: `${component.dialog.padding} ${component.dialog.padding} 0`,
        },
      },
    },

    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: `${component.dialog.padding} ${component.dialog.padding} 0`,
          '.MuiDialogTitle-root + &': { paddingTop: component.dialog.textGap },
          // 선은 긋지 않는다(dividers 를 주어도 같다).
          variants: [{ props: { dividers: true }, style: { borderTop: 0, borderBottom: 0 } }],
        },
      },
    },

    MuiDialogContentText: {
      styleOverrides: {
        root: { ...font('body'), color: colors.text.secondary, margin: 0 },
      },
    },

    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: component.dialog.padding,
          gap: space.controlGap,
          justifyContent: 'flex-end',
          '& > :not(style) ~ :not(style)': { marginLeft: 0 },
        },
      },
    },

    // 메뉴, 툴팁, 토스트는 커지는 움직임(Grow) 없이 바로 나타난다(꾸밈 움직임 금지, 2026-10-14 결정).
    // 판과 가림막의 옅어짐(Fade), 서랍의 밀려 나옴(Slide)은 MUI 기본 그대로 둔다.
    MuiTooltip: {
      defaultProps: { slotProps: { transition: { timeout: 0 } } },
      styleOverrides: {
        tooltip: {
          ...font('meta'),
          color: onFill,
          backgroundColor: colors.surface.inverse,
          padding: `${component.tooltip.paddingY} ${component.tooltip.paddingX}`,
          borderRadius: radius.control,
          maxWidth: component.tooltip.maxWidth,
          wordBreak: 'keep-all',
          overflowWrap: 'anywhere',
        },
        arrow: { color: colors.surface.inverse },
      },
    },

    // 입력칸은 높이 40 하나다. 라벨 자리를 40 에 맞추려고 기본 크기를 small 로 둔다.
    MuiTextField: { defaultProps: { size: 'small' } },
    MuiFormControl: { defaultProps: { size: 'small' } },

    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...font('body'),
          color: colors.text.body,
          backgroundColor: colors.surface.card,
          borderRadius: radius.control,
          ...(ownerState.multiline
            ? {
                // 한 줄일 때 높이가 입력칸 높이와 같도록 위아래 여백을 정한다.
                padding: `calc((${height.input} - ${levels.body.lineHeight}) / 2) ${component.input.paddingX}`,
              }
            : { height: height.input }),
          ...(ownerState.startAdornment ? { paddingLeft: component.input.paddingX } : {}),
          ...(ownerState.endAdornment
            ? { '--_trailingPad': component.input.paddingX, paddingRight: 'var(--_trailingPad)' }
            : {}),
          '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border.control },
          '&:hover:not(.Mui-focused):not(.Mui-error):not(.Mui-disabled) .MuiOutlinedInput-notchedOutline':
            { borderColor: colors.border.strong },
          '&.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.brand.main,
            borderWidth: component.focusRing.width,
          },
        }),
        input: ({ ownerState }) => ({
          ...(ownerState.multiline
            ? { padding: 0 }
            : {
                padding: `0 ${component.input.paddingX}`,
                ...(ownerState.startAdornment ? { paddingLeft: 0 } : {}),
                ...(ownerState.endAdornment ? { paddingRight: 0 } : {}),
              }),
          '&::placeholder': { color: colors.text.tertiary, opacity: 1 },
        }),
      },
    },

    MuiTabs: {
      styleOverrides: {
        root: { minHeight: height.tab, borderBottom: hairline(colors.border.subtle) },
        list: { gap: component.tab.gap },
        indicator: ({ ownerState }) => ({
          // 밑줄은 탭 사이를 미끄러지지 않고 고른 탭으로 바로 옮겨 간다(꾸밈 움직임 금지).
          transition: 'none',
          ...(ownerState.orientation === 'vertical'
            ? {}
            : {
                // 밑줄은 탭 양 끝에서 안으로 들인다(견본 .tab.on::after).
                height: component.tab.indicatorHeight,
                backgroundColor: 'transparent',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  left: component.tab.indicatorInset,
                  right: component.tab.indicatorInset,
                  bottom: 0,
                  height: '100%',
                  backgroundColor: colors.brand.main,
                },
              }),
        }),
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          ...font('control'),
          ...insetFocusRing,
          minWidth: 0,
          minHeight: height.tab,
          height: height.tab,
          padding: `0 ${component.tab.paddingX}`,
          gap: component.tab.countGap,
          textTransform: 'none',
          variants: [
            {
              props: { textColor: 'primary' },
              style: {
                color: colors.text.secondary,
                '&.Mui-selected': { color: colors.text.primary, fontWeight: typography.buttonWeight },
                '&.Mui-disabled': { color: colors.text.disabled },
              },
            },
          ],
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          ...font('body'),
          color: colors.text.body,
          borderBottom: 0,
          variants: [
            {
              props: { padding: 'normal' },
              style: { padding: `0 calc(${component.table.columnGap} / 2)` },
            },
            {
              // 행 구분선은 행 위에 긋는다. 첫 행의 선이 머리 아래 선이 되고, 마지막 행 아래에는 선이 없다.
              props: { variant: 'body' },
              style: { height: height.row, borderTop: hairline(colors.border.subtle) },
            },
            {
              props: { variant: 'head' },
              style: {
                ...font('label'),
                color: colors.text.tertiary,
                paddingTop: 0,
                paddingBottom: component.table.headGap,
              },
            },
            {
              // MUI 는 고정 머리의 바탕을 background.default(바닥 색)로 칠한다. 카드 위에서는 카드 색이어야 한다.
              props: { stickyHeader: true },
              style: { backgroundColor: colors.surface.card },
            },
          ],
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: { '&.MuiTableRow-hover:hover': { backgroundColor: colors.surface.hover } },
      },
    },

    // 고리 표시는 색만 정한다. 지름, 두께, 바탕 고리(견본 .ring, .spin)는 Spinner 부품이 그린다.
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          variants: [{ props: { color: 'primary' }, style: { color: colors.brand.main } }],
        },
      },
    },

    MuiMenu: {
      defaultProps: { transitionDuration: 0 },
      styleOverrides: {
        paper: { borderRadius: radius.control, boxShadow: shadow.overlay },
      },
    },

    MuiPopover: {
      defaultProps: { transitionDuration: 0 },
      styleOverrides: {
        paper: { borderRadius: radius.control, boxShadow: shadow.overlay },
      },
    },

    MuiSnackbar: {
      defaultProps: { transitionDuration: 0 },
    },

    MuiMenuItem: {
      styleOverrides: { root: insetFocusRing },
    },

    MuiListItemButton: {
      styleOverrides: { root: insetFocusRing },
    },

    MuiSwitch: {
      styleOverrides: {
        // 켜진 바탕은 color="primary" 일 때만 정한다. color 를 주지 않은 스위치도 primary 다. 다른 color 는
        // MUI 기본을 따라 그 color 의 main 을 opacity 0.5 로 칠한다.
        // MUI 는 켜진 바탕을 switchBase 의 '.Mui-checked + .MuiSwitch-track' 으로 칠하므로 같은 선택자로 덮는다.
        // color 를 주지 않고 sx 로 켜진 바탕의 색만 덮으면 여기의 opacity 1 은 그대로 받는다. 덮은 색이 손잡이와
        // 같으면 손잡이가 바탕에 묻히므로 opacity 도 함께 덮는다.
        switchBase: {
          ...insetFocusRing,
          variants: [
            {
              props: { color: 'primary' },
              style: {
                '&.Mui-checked + .MuiSwitch-track': { backgroundColor: component.switch.trackOn, opacity: 1 },
              },
            },
          ],
        },
        // MUI 는 손잡이에 shadows[1] 을 쓰는데, 이 테마의 shadows[1] 은 카드 그림자라 흰 카드 위에서 손잡이가 사라진다.
        thumb: { boxShadow: component.switch.thumbShadow },
        // 꺼진 바탕. 꺼진 스위치(disabled)의 옅은 바탕은 MUI 의 '.Mui-disabled + .MuiSwitch-track' 이 더 높은 우선순위로 준다.
        track: { backgroundColor: component.switch.trackOff, opacity: 1 },
      },
    },

    // 그림자는 카드와 판 두 가지뿐이다. elevation 그림자는 위의 shadows 가 두 값으로 바꾸고,
    // 아래 부품은 견본의 자리에 맞춰 그림자를 정한다. 견본의 상단 바(.appbar)에는 그림자가 없다.
    MuiAppBar: {
      defaultProps: { elevation: 0 },
    },

    MuiDrawer: {
      styleOverrides: {
        // 화면 위에 뜨는 서랍(temporary)만 판 그림자를 쓴다. 늘 보이는 서랍(permanent, persistent)은 MUI 처럼 그림자가 없다.
        paper: {
          variants: [{ props: { variant: 'temporary' }, style: { boxShadow: shadow.overlay } }],
        },
      },
    },

    // 토스트의 그림자.
    MuiSnackbarContent: {
      styleOverrides: { root: { boxShadow: shadow.overlay } },
    },

    // 카드 모양(견본 .card). 카드 그림자는 옅어서 선이 카드의 둘레를 긋는다.
    // 그림자는 elevation 을 따른다. 기본 elevation 1 은 card 그림자, elevation={0} 은 그림자가 없다.
    MuiCard: {
      styleOverrides: {
        root: {
          border: hairline(colors.border.default),
          borderRadius: radius.card,
        },
      },
    },

    // 손잡이에 주 색 고리 그림자(hover·초점 8px, 끌기 14px)를 두지 않는다(색 그림자 금지).
    // MUI 가 손잡이의 ::before 에 거는 elevation 2 그림자도 지운다. 그림자는 카드와 판에만 쓴다.
    // 키보드 초점은 다른 조작처럼 남색 2px 테두리로 보인다.
    MuiSlider: {
      styleOverrides: {
        thumb: {
          '&::before': { boxShadow: 'none' },
          '&:hover': { boxShadow: 'none' },
          '&.Mui-active': { boxShadow: 'none' },
          '&.Mui-focusVisible': {
            boxShadow: 'none',
            outline: `${component.focusRing.width} solid ${colors.brand.main}`,
            outlineOffset: component.focusRing.offset,
          },
        },
      },
    },
  },
};
