import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { fonts as f, ThemeColors, useTheme } from '../theme';
import { Icon, IconName, T } from './ui';

export function BottomNavigation() {
  const path = usePathname(); const insets = useSafeAreaInsets(); const { setSheet } = useApp();
  const c = useTheme(); const styles = useMemo(() => createStyles(c), [c]);
  function navigate(destination: '/' | '/scan' | '/account') {
    setSheet(null);
    if (path !== destination) router.replace(destination);
  }
  const profileActive = ['/account', '/rentals', '/how-it-works'].includes(path);
  return <View testID="bottom-navigation" style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
    <View style={styles.items}>
      <NavItem label="Map" icon="map" active={path === '/'} onPress={() => navigate('/')} c={c} styles={styles} />
      <Pressable accessibilityRole="button" accessibilityLabel="Scan to rent" accessibilityState={{ selected: path === '/scan' }} onPress={() => navigate('/scan')} style={styles.scanItem}>
        <View style={[styles.scanIcon, path === '/scan' && { backgroundColor: c.blue }]}><Icon name="maximize" color={c.greenDark} size={28} /></View>
        <T style={[styles.label, { color: c.green, fontFamily: f.bold }]}>Scan to rent</T>
      </Pressable>
      <NavItem label="Profile" icon="user" active={profileActive} onPress={() => navigate('/account')} c={c} styles={styles} />
    </View>
  </View>;
}
function NavItem({ label, icon, active, onPress, c, styles }: { label: string; icon: IconName; active: boolean; onPress: () => void; c: ThemeColors; styles: ReturnType<typeof createStyles> }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: active }} onPress={onPress} style={styles.item}>
    <Icon name={icon} size={22} color={active ? c.green : c.muted} />
    <T style={[styles.label, active && { color: c.green, fontFamily: f.bold }]}>{label}</T>
    {active && <View style={styles.indicator} />}
  </Pressable>;
}
const createStyles = (c: ThemeColors) => StyleSheet.create({
  bar: { backgroundColor: c.paper, borderTopWidth: 1, borderTopColor: c.line, paddingTop: 8, zIndex: 30 },
  items: { width: '100%', maxWidth: 780, alignSelf: 'center', flexDirection: 'row', alignItems: 'center' },
  item: { flex: 1, minWidth: 0, minHeight: 66, alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 2 },
  label: { fontSize: 10, lineHeight: 14, color: c.muted, fontFamily: f.medium, textAlign: 'center' },
  scanItem: { flex: 1, minWidth: 0, alignItems: 'center', gap: 5, paddingHorizontal: 2 },
  scanIcon: { width: 54, height: 54, borderRadius: 19, backgroundColor: c.lime, justifyContent: 'center', alignItems: 'center' },
  indicator: { position: 'absolute', bottom: 0, width: 4, height: 4, borderRadius: 2, backgroundColor: c.lime },
});
