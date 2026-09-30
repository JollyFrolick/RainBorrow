import { useApp } from './context/AppContext';

export const lightColors = {
  ink: '#193D35', green: '#245B49', greenDark: '#183E33', sage: '#E8EEE5',
  mint: '#D2E7C6', lime: '#DFF299', cream: '#F8F9F5', paper: '#FFFFFF',
  muted: '#7D8981', line: '#E4E8E0', orange: '#B47335', orangeLight: '#FFF0DD',
  blue: '#5C92B5', red: '#AD5045',
};
export const darkColors: typeof lightColors = {
  ink: '#F1F5EF', green: '#39765E', greenDark: '#10251D', sage: '#263A31',
  mint: '#31513F', lime: '#DFF299', cream: '#101713', paper: '#19231E',
  muted: '#A7B2AB', line: '#35463D', orange: '#E0A060', orangeLight: '#4A3322',
  blue: '#79A9C8', red: '#EE8D83',
};
export type ThemeColors = typeof lightColors;
/** Light palette retained for non-react startup surfaces. */
export const colors = lightColors;
export function useTheme(): ThemeColors {
  return useApp().appearance === 'dark' ? darkColors : lightColors;
}
export const fonts = { regular: 'DMSans_400Regular', medium: 'DMSans_500Medium', semibold: 'DMSans_600SemiBold', bold: 'DMSans_700Bold', display: 'DMSerifDisplay_400Regular' };
