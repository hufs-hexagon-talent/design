// Tailwind 3 preset. tailwind.config.js 에서 presets: [require('@studyroom/design/tailwind')] 로 쓴다.
// CJS 로만 빌드해 require() 결과가 곧 preset 객체가 되게 한다(export =).
// 값은 모두 theme.extend 에 넣는다. user-app 은 theme.colors 를 통째로 바꾸므로,
// preset 이 theme.colors 처럼 바로 넣은 값은 앱 설정에 밀려 사라진다.
// plugins, presets, base 스타일은 두지 않는다. presets: [] 를 두면 Tailwind 기본 설정이 통째로 빠진다.
// 값 밖에서는 future 의 hoverOnlyWhenSupported 하나만 켠다(아래 future 의 설명).
import type { Config } from 'tailwindcss';
import { colors, radius, shadow, typography } from './tokens.js';

const { levels } = typography;

// 글자 크기는 Tailwind 의 t-shirt 이름만 쓴다. flowbite-react 가 쓰는 tailwind-merge 2.2.2 는
// /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/ 꼴과 base 만 글자 크기로 읽고, 다른 이름(text-meta 등)은 글자색으로 여겨
// 같은 줄의 글자색 class 를 지운다. 굵기와 자간은 넣지 않는다. 넣으면 기존 text-lg, text-2xl 이 말없이 굵어지거나 좁아진다.
const size = (name: keyof typeof levels): [string, { lineHeight: string }] => [
  levels[name].fontSize,
  { lineHeight: levels[name].lineHeight },
];

const preset = {
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: colors.brand.main,
          hover: colors.brand.hover,
          subtle: colors.brand.subtle,
        },
        success: colors.status.success,
        danger: colors.status.danger,
        warning: colors.status.warning,
      },
      textColor: {
        primary: colors.text.primary,
        body: colors.text.body,
        secondary: colors.text.secondary,
        tertiary: colors.text.tertiary,
        disabled: colors.text.disabled,
        // inverse 면(bg-inverse) 위의 글자 네 단계. 바닥글, 짙은 블록, 토스트가 쓴다.
        'inverse-primary': colors.inverse.text.primary,
        'inverse-body': colors.inverse.text.body,
        'inverse-secondary': colors.inverse.text.secondary,
        'inverse-tertiary': colors.inverse.text.tertiary,
      },
      backgroundColor: {
        page: colors.surface.page,
        card: colors.surface.card,
        subtle: colors.surface.subtle,
        hover: colors.surface.hover,
        selected: colors.surface.selected,
        disabled: colors.surface.disabled,
        inverse: colors.surface.inverse,
        overlay: colors.overlay,
      },
      borderColor: {
        DEFAULT: colors.border.default,
        // border 의 기본 색과 같은 값이다. 다른 선 색을 준 요소를 기본 색으로 되돌릴 때 쓴다(예: disabled:border-default).
        default: colors.border.default,
        subtle: colors.border.subtle,
        control: colors.border.control,
        strong: colors.border.strong,
      },
      // inverse 면 위의 초점 고리 사이 색(ring-offset-inverse).
      ringOffsetColor: {
        inverse: colors.surface.inverse,
      },
      fontSize: {
        '2xl': size('title'),
        lg: size('heading'),
        base: size('prose'),
        md: size('body'),
        sm: size('control'),
        xs: size('meta'),
        '2xs': size('label'),
        '3xs': size('micro'),
      },
      // 자간은 새 이름(tracking-<단계>)으로 따로 둔다. 자간이 0 인 단계(meta, label, micro)는 두지 않는다.
      // tailwind-merge 2.2.2 는 이 이름을 모르는 class 로 보고 그대로 남긴다.
      letterSpacing: {
        title: levels.title.letterSpacing,
        heading: levels.heading.letterSpacing,
        prose: levels.prose.letterSpacing,
        body: levels.body.letterSpacing,
        control: levels.control.letterSpacing,
      },
      borderRadius: {
        lg: radius.control,
        '2xl': radius.card,
      },
      boxShadow: {
        sm: shadow.card,
        xl: shadow.overlay,
      },
      fontFamily: {
        sans: typography.fontFamily,
      },
    },
  },
  // hover: 계열 class(hover:, group-hover:, peer-hover:)를 마우스처럼 hover 가 되는 기기에서만 건다. Tailwind 는
  // 그 class 를 '@media (hover: hover) and (pointer: fine)' 안에 둔다. 휴대폰 브라우저는 손가락으로 누른 요소에
  // :hover 를 바깥을 누를 때까지 남기므로, 조건 없이 걸면 누른 버튼에 hover 면이 남는다.
  // Tailwind 는 preset 의 future 를 앱 설정에 합친다. 다만 키 단위로 합쳐서, 앱 설정에 future 가 있으면 앱의
  // future 가 통째로 이기고 이 값은 빠진다. 그때는 앱 설정의 future 에 이 값을 함께 적는다.
  future: {
    hoverOnlyWhenSupported: true,
  },
} satisfies Partial<Config>;

export = preset;
