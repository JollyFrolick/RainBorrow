import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextProps, View, ViewStyle } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import Svg, { Path, Circle, Ellipse, G } from 'react-native-svg';
import { colors as lightColors, fonts as f, ThemeColors, useTheme } from '../theme';

export type IconName = React.ComponentProps<typeof Feather>['name'];
export function Icon({ name, size = 20, color }: { name: IconName; size?: number; color?: string }) { const c = useTheme(); return <Feather name={name} size={size} color={color || c.ink} />; }
const textScale = .86;
export function T({ style, ...props }: TextProps) {
  const c = useTheme();
  const flattened = StyleSheet.flatten(style);
  const compact = flattened && {
    ...flattened,
    ...(typeof flattened.fontSize === 'number' ? { fontSize: Math.max(8, Math.round(flattened.fontSize * textScale)) } : null),
    ...(typeof flattened.lineHeight === 'number' ? { lineHeight: Math.max(11, Math.round(flattened.lineHeight * textScale)) } : null),
  };
  return <Text {...props} style={[{ fontFamily: f.regular, fontSize: 12, color: c.ink }, compact]} />;
}
export function Button({ title, onPress, icon, secondary, disabled, loading, style, testID }: { title: string; onPress: () => void; icon?: IconName; secondary?: boolean; disabled?: boolean; loading?: boolean; style?: ViewStyle; testID?: string }) {
  const c = useTheme(); const s = useUiStyles();
  return <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled: !!disabled }} onPress={onPress} disabled={disabled || loading} style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [s.button, secondary ? s.secondary : s.primary, (disabled || loading) && { opacity: .45 }, pressed && { transform: [{ scale: .98 }] }, hovered && !disabled && { opacity: .85 }, style]}>
    {loading ? <ActivityIndicator color={secondary ? c.green : c.greenDark} size="small" /> : icon ? <Icon name={icon} color={secondary ? c.green : c.greenDark} size={18} /> : null}<T style={{ fontFamily: f.semibold, color: secondary ? c.green : c.greenDark, fontSize: 14, flexShrink: 1, textAlign: 'center' }}>{title}</T>
  </Pressable>;
}
export function IconButton({ icon, onPress, label, style, size = 19 }: { icon: IconName; onPress: () => void; label: string; style?: ViewStyle; size?: number }) { const c = useTheme(); const s = useUiStyles(); return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ hovered, pressed }: { pressed: boolean; hovered?: boolean }) => [s.iconButton, hovered && { backgroundColor: c.sage }, pressed && { opacity: .6 }, style]}><Icon name={icon} size={size} /></Pressable>; }
export function Pill({ children, tone = 'green' }: { children: React.ReactNode; tone?: 'green' | 'orange' | 'gray' }) { const c = useTheme(); const s = useUiStyles(); return <View style={[s.pill, { backgroundColor: tone === 'orange' ? c.orangeLight : tone === 'gray' ? c.sage : c.sage }]}><T style={{ fontSize: 11, fontFamily: f.semibold, color: tone === 'orange' ? c.orange : tone === 'gray' ? c.muted : c.green }}>{children}</T></View>; }
export function UmbrellaArt({ width = 160, height = 150, dark = false }: { width?: number; height?: number; dark?: boolean }) {
  const c = useTheme();
  return <Svg width={width} height={height} viewBox="0 0 200 180"><Ellipse cx="110" cy="164" rx="48" ry="7" fill={dark ? c.paper : c.sage} /><G transform="rotate(-18 100 85)"><Path d="M100 16v123c0 24 35 23 35 0" stroke={c.lime} strokeWidth="6" fill="none" strokeLinecap="round"/><Path d="M20 86a80 70 0 0 1 160 0c-12-13-27-13-40 0-12-13-27-13-40 0-12-13-27-13-40 0-12-13-27-13-40 0Z" fill={dark ? c.lime : c.blue} stroke={dark ? c.lime : c.green} strokeWidth="2"/><Path d="M100 16C73 31 61 53 60 86M100 16c27 15 39 37 40 70M100 16v70" stroke={dark ? c.greenDark : c.green} strokeWidth="2" fill="none"/></G><Path d="m28 20-4 12m144 0-4 12M42 112l-4 12M176 111l-4 12" stroke={c.blue} strokeWidth="3" strokeLinecap="round"/><Circle cx="160" cy="152" r="3" fill={c.lime}/></Svg>;
}
function createUiStyles(c: ThemeColors) { return StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 }, between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  button: { minHeight: 48, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }, primary: { backgroundColor: c.lime }, secondary: { borderWidth: 1, borderColor: c.line, backgroundColor: c.paper },
  iconButton: { width: 42, height: 42, backgroundColor: c.paper, borderWidth: 1, borderColor: c.line, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  pill: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 6, alignSelf: 'flex-start' },
  card: { backgroundColor: c.paper, borderWidth: 1, borderColor: c.line, borderRadius: 20, padding: 24 },
  label: { fontFamily: f.semibold, color: c.muted, fontSize: 10, letterSpacing: 1.6 }, muted: { color: c.muted, lineHeight: 18 },
  title: { fontFamily: f.display, fontSize: 40, lineHeight: 46, letterSpacing: -.6 }, input: { fontFamily: f.regular, color: c.ink, fontSize: 12, borderWidth: 1, borderColor: c.line, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 14, minHeight: 48, backgroundColor: c.cream },
}); }
export function useUiStyles() { const c = useTheme(); return useMemo(() => createUiStyles(c), [c]); }
/** @deprecated Use useUiStyles inside React components for theme-aware styles. */
export const s = createUiStyles(lightColors);
