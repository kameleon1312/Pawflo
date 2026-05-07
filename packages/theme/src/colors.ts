export const Colors = {
  // Brand primary — Tinder warmth
  coral: '#F08A8A',
  coralDeep: '#D85F5F',
  coralSoft: '#F4A8A8',
  coralMist: '#FCEBE7',

  // Surface — Family-tech warmth
  cream: '#F8EFE2',
  bone: '#FAF4E9',
  paper: '#FBF3E6',
  ink: '#1B1411',       // warm black, NEVER #000
  inkSoft: '#2A1F19',
  inkTint: 'rgba(27,20,17,0.6)',

  // Lines & dividers
  roseLine: '#F4C2C2',
  warmLine: '#E5DBC5',

  // Status
  success: '#4A8B5C',
  warning: '#D4A86A',
  danger: '#C95553',
  info: '#5C8AB5',

  // Text hierarchy
  textHi: '#1B1411',
  textMid: '#4A3C30',
  textLow: '#6B5C4F',
  textFaint: '#9A8B7F',
} as const;

export type ColorToken = keyof typeof Colors;
