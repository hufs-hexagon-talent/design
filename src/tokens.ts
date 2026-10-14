// 두 앱(admin-app, user-app)이 함께 쓰는 값의 유일한 원본이다.
// 값은 2026-10-14 견본 v2 의 CSS 에서 가져왔다. 두 값은 예외다. colors.inverse.text.tertiary 는 견본 v1 과
// 화면 패턴 조사에서 가져왔고, component.focusRing 은 계획의 초점 규칙에 맞춰 새로 정했다.
// mui.ts, tailwind.ts, tokens.css 는 모두 이 파일에서 값을 읽는다.
// 값을 바꿀 때는 이 파일만 고치고, 버전과 태그를 함께 올린다.

/** 색. 이름은 화면이 아니라 역할을 가리킨다. */
export const colors = {
  /** 주 색. hover 는 주 색 버튼에 마우스를 올렸을 때, subtle 은 고른 메뉴 같은 옅은 바탕이다. */
  brand: { main: '#002D56', hover: '#003B70', subtle: '#E8F0F7' },
  /** 글자 다섯 단계. disabled 는 꺼진 조작에만 쓴다. */
  text: {
    primary: '#151A22',
    body: '#2A2E36',
    secondary: '#5B6270',
    tertiary: '#676D77',
    disabled: '#A8AEB8',
  },
  /** 면. page 는 화면 바닥, card 는 카드와 판, inverse 는 툴팁·토스트·짙은 블록이다. */
  surface: {
    page: '#EEF0F4',
    card: '#FFFFFF',
    subtle: '#F5F6F9',
    hover: '#EEF0F4',
    selected: '#E8F0F7',
    disabled: '#E8EAEE',
    inverse: '#141C2C',
  },
  /** 판 뒤의 가림막. */
  overlay: 'rgba(15, 22, 38, 0.42)',
  /** 선 네 단계. default 는 카드 테두리, control 은 입력칸과 보조 버튼 테두리다. */
  border: { subtle: '#EFF1F4', default: '#E2E5EB', control: '#D8DCE3', strong: '#C4CAD3' },
  /** 상태 글자와 위험 버튼 면. */
  status: { success: '#1B7A4C', danger: '#B42318', warning: '#B54708' },
  /** inverse 면과 주 색·위험 면 위의 글자. primary 는 흰 글자다. */
  inverse: {
    text: { primary: '#FFFFFF', body: '#E9ECF3', secondary: '#A5AEC0', tertiary: '#8A93A6' },
  },
} as const;

/** 글자 한 단계의 값. */
export interface TypographyLevel {
  readonly fontSize: string;
  readonly lineHeight: string;
  readonly fontWeight: number;
  readonly letterSpacing: string;
}

/** 글자. 단계는 8개이고 이 밖의 크기를 쓰지 않는다. */
export const typography = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Apple SD Gothic Neo", "Malgun Gothic", "Helvetica Neue", Arial, sans-serif',
  levels: {
    /** 화면 제목. */
    title: { fontSize: '22px', lineHeight: '30px', fontWeight: 700, letterSpacing: '-0.02em' },
    /** 카드 제목, 판 제목. */
    heading: { fontSize: '17px', lineHeight: '24px', fontWeight: 700, letterSpacing: '-0.02em' },
    /** 문의 본문 같은 긴 글. */
    prose: { fontSize: '16px', lineHeight: '26px', fontWeight: 400, letterSpacing: '-0.01em' },
    /** 표, 입력값, 판의 한 줄. */
    body: { fontSize: '15px', lineHeight: '22px', fontWeight: 400, letterSpacing: '-0.01em' },
    /** 버튼, 탭, 메뉴, 상태 글자. 버튼은 buttonWeight 로 굵게 쓴다. */
    control: { fontSize: '14px', lineHeight: '20px', fontWeight: 500, letterSpacing: '-0.01em' },
    /** 결과 수, 시각, 이유 한 줄. */
    meta: { fontSize: '13px', lineHeight: '18px', fontWeight: 400, letterSpacing: '0' },
    /** 열 제목, 묶음 이름. */
    label: { fontSize: '12px', lineHeight: '16px', fontWeight: 600, letterSpacing: '0' },
    /** 달력 칸. */
    micro: { fontSize: '11px', lineHeight: '14px', fontWeight: 500, letterSpacing: '0' },
  },
  /** 좁은 폭의 화면 제목. */
  titleNarrow: { fontSize: '20px', lineHeight: '28px' },
  /** 버튼 글자 굵기. 크기와 줄높이는 control 단계를 쓴다. */
  buttonWeight: 600,
} as const satisfies {
  fontFamily: string;
  levels: Record<string, TypographyLevel>;
  titleNarrow: Pick<TypographyLevel, 'fontSize' | 'lineHeight'>;
  buttonWeight: number;
};

/** 모서리 두 가지. control 은 조작과 안쪽 상자, card 는 카드와 판이다. */
export const radius = { control: '8px', card: '14px' } as const;

/** 그림자 두 가지. card 는 카드에, overlay 는 판, 화면 위에 뜨는 서랍, 토스트, 메뉴에 쓴다. */
export const shadow = {
  card: '0 1px 2px rgba(16, 24, 40, 0.04)',
  overlay: '0 14px 38px rgba(15, 22, 38, 0.15), 0 2px 6px rgba(15, 22, 38, 0.06)',
} as const;

/** 높이. buttonSmall 은 표 안, buttonTouch 는 휴대폰에서 누르는 버튼과 아이콘 버튼이다. */
export const height = {
  button: '36px',
  buttonSmall: '32px',
  buttonTouch: '44px',
  input: '40px',
  row: '48px',
  rowTwoLine: '56px',
  tab: '44px',
} as const;

/** 간격. 4px 단위다. */
export const space = {
  /** 본문 바깥 여백. */
  page: '32px',
  pageNarrow: '16px',
  /** 카드 안쪽 여백. */
  cardPadding: '28px',
  cardPaddingNarrow: '16px',
  /** 카드 사이. */
  cardGap: '24px',
  /** 화면 제목 아래. */
  titleGap: '24px',
  /** 카드 안의 줄 사이. */
  inCard: '16px',
  /** 버튼 묶음 같은 조작 사이. */
  controlGap: '8px',
  /** 검색칸, 스위치, 결과 수처럼 한 줄에 놓인 요소 사이. */
  inlineGap: '12px',
} as const;

/**
 * 부품 안쪽 치수. 견본 CSS 의 값이고, mui.ts 와 docs/components.md 가 쓴다.
 * 견본 값을 그대로 옮겨서 4px 단위가 아닌 값(22, 14, 10, 6, 2.5)도 있다.
 */
export const component = {
  button: {
    paddingX: '16px',
    paddingXSmall: '12px',
    paddingXTouch: '22px',
    paddingXGhost: '12px',
    iconGap: '6px',
    iconSize: '18px',
  },
  iconButton: { size: '32px', iconSize: '20px' },
  /** 키보드 초점 테두리. 누를 때 물결을 껐으므로 초점은 이 테두리로만 보인다. */
  focusRing: { width: '2px', offset: '2px' },
  input: { paddingX: '12px', adornmentGap: '8px' },
  tab: { paddingX: '14px', gap: '4px', countGap: '6px', indicatorHeight: '2px', indicatorInset: '8px' },
  table: { columnGap: '24px', headGap: '8px', bleed: '10px' },
  dialog: { width: '462px', padding: '24px', textGap: '8px', actionMinWidth: '96px' },
  tooltip: { paddingY: '8px', paddingX: '12px', maxWidth: '300px' },
  notice: { paddingY: '12px', paddingX: '16px' },
  toast: { paddingY: '10px', paddingX: '16px' },
  /** 고리는 brand.subtle 바탕에 brand 호. 버튼 안 표시(inline)는 흰 호와 옅은 흰 바탕이다. */
  spinner: {
    size: '20px',
    thickness: '2.5px',
    inlineSize: '14px',
    inlineThickness: '2px',
    inlineTrack: 'rgba(255, 255, 255, 0.35)',
  },
} as const;

export const tokens = { colors, typography, radius, shadow, height, space, component } as const;

export type Tokens = typeof tokens;
export type TypographyLevelName = keyof typeof typography.levels;
