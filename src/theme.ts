import { useApp } from './context/AppContext';

export const lightColors = {
  ink: '#073B4C', green: '#087A3E', greenDark: '#063747', sage: '#DDF4FF',
  mint: '#C9F7D8', lime: '#45F28A', cream: '#F3FAFF', paper: '#FFFFFF',
  muted: '#5D7883', line: '#C3E4F2', orange: '#A85A19', orangeLight: '#FFF0DD',
  blue: '#38BDF8', red: '#B93846',
};
export const darkColors: typeof lightColors = {
  ink: '#EAFBFF', green: '#25B866', greenDark: '#061F2B', sage: '#103544',
  mint: '#124C38', lime: '#45F28A', cream: '#071923', paper: '#0C2733',
  muted: '#9CB8C2', line: '#245267', orange: '#F0A35E', orangeLight: '#4A2E1C',
  blue: '#63CEFF', red: '#FF8A96',
};
export type ThemeColors = typeof lightColors;
/** Light palette retained for non-react startup surfaces. */
export const colors = lightColors;
export function useTheme(): ThemeColors {
  return useApp().appearance === 'dark' ? darkColors : lightColors;
}
export const fonts = { regular: 'DMSans_400Regular', medium: 'DMSans_500Medium', semibold: 'DMSans_600SemiBold', bold: 'DMSans_700Bold', display: 'DMSerifDisplay_400Regular' };
