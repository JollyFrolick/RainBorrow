import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextProps, View, ViewStyle } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import Svg, { Path, Circle, Ellipse, G } from 'react-native-svg';
import { colors as c, fonts as f } from '../theme';

export type IconName = React.ComponentProps<typeof Feather>['name'];
export function Icon({ name, size = 20, color = c.ink }: { name: IconName; size?: number; color?: string }) { return <Feather name={name} size={size} color={color} />; }
export function T({ style, ...props }: TextProps) { return <Text {...props} style={[{ fontFamily: f.regular, fontSize: 14, color: c.ink }, style]} />; }
export function Button({ title, onPress, icon, secondary, disabled, loading, style, testID }: { title: string; onPress: () => void; icon?: IconName; secondary?: boolean; disabled?: boolean; loading?: boolean; style?: ViewStyle; testID?: string }) {
  return <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled: !!disabled }} onPress={onPress} disabled={disabled || loading} style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [s.button, secondary ? s.secondary : s.primary, (disabled || loading) && { opacity: .45 }, pressed && { transform: [{ scale: .98 }] }, hovered && !disabled && { opacity: .85 }, style]}>
    {loading ? <ActivityIndicator color={secondary ? c.greenDark : c.white} size="small" /> : icon ? <Icon name={icon} color={secondary ? c.greenDark : c.white} size={18} /> : null}<T style={{ fontFamily: f.semibold, color: secondary ? c.greenDark : c.white, fontSize: 14, flexShrink: 1, textAlign: 'center' }}>{title}</T>
  </Pressable>;
}
export function IconButton({ icon, onPress, label, style }: { icon: IconName; onPress: () => void; label: string; style?: ViewStyle }) { return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ hovered, pressed }: { pressed: boolean; hovered?: boolean }) => [s.iconButton, hovered && { backgroundColor: c.sage }, pressed && { opacity: .6 }, style]}><Icon name={icon} size={19} /></Pressable>; }
export function Pill({ children, tone = 'green' }: { children: React.ReactNode; tone?: 'green' | 'orange' | 'gray' }) { return <View style={[s.pill, { backgroundColor: tone === 'orange' ? c.orangeLight : tone === 'gray' ? c.grayLight : c.sage }]}><T style={{ fontSize: 11, fontFamily: f.bold, color: tone === 'orange' ? c.orange : tone === 'gray' ? c.ink : c.greenDark }}>{children}</T></View>; }
export function UmbrellaArt({ width = 160, height = 150, dark = false }: { width?: number; height?: number; dark?: boolean }) {
  return <Svg width={width} height={height} viewBox="0 0 200 180"><Ellipse cx="110" cy="164" rx="48" ry="7" fill={dark ? '#063428' : '#C7DED3'} /><G transform="rotate(-18 100 85)"><Path d="M100 16v123c0 24 35 23 35 0" stroke={dark ? c.white : c.greenDark} strokeWidth="6" fill="none" strokeLinecap="round"/><Path d="M20 86a80 70 0 0 1 160 0c-12-13-27-13-40 0-12-13-27-13-40 0-12-13-27-13-40 0-12-13-27-13-40 0Z" fill={dark ? c.lime : c.mint} stroke={dark ? c.lime : c.green} strokeWidth="2"/><Path d="M100 16C73 31 61 53 60 86M100 16c27 15 39 37 40 70M100 16v70" stroke={dark ? '#78A91A' : c.green} strokeWidth="2" fill="none"/></G><Path d="m28 20-4 12m144 0-4 12M42 112l-4 12M176 111l-4 12" stroke={dark ? '#7BDDB1' : c.green} strokeWidth="3" strokeLinecap="round"/><Circle cx="160" cy="152" r="3" fill={dark ? c.mint : c.green}/></Svg>;
}
export const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 }, between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  button: { minHeight: 48, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }, primary: { backgroundColor: c.green }, secondary: { borderWidth: 1.5, borderColor: c.green, backgroundColor: c.sage },
  iconButton: { width: 42, height: 42, backgroundColor: c.paper, borderWidth: 1.5, borderColor: c.line, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  pill: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 6, alignSelf: 'flex-start' },
  card: { backgroundColor: c.paper, borderWidth: 1.5, borderColor: c.line, borderRadius: 20, padding: 24 },
  label: { fontFamily: f.bold, color: c.green, fontSize: 10, letterSpacing: 1.6 }, muted: { color: c.muted, lineHeight: 21 },
  title: { fontFamily: f.display, fontSize: 40, lineHeight: 46, letterSpacing: -.6 }, input: { fontFamily: f.regular, color: c.ink, fontSize: 14, borderWidth: 1.5, borderColor: c.line, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 14, minHeight: 48, backgroundColor: c.paper },
});
