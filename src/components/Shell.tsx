import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors as c, fonts as f } from '../theme';
import { Icon, IconName, Pill, s, T } from './ui';
import { useApp } from '../context/AppContext';

const tabs: { title: string; path: '/' | '/rentals' | '/how-it-works' | '/account'; icon: IconName }[] = [
  { title: 'Explore', path: '/', icon: 'map' }, { title: 'My rentals', path: '/rentals', icon: 'clock' },
  { title: 'How it works', path: '/how-it-works', icon: 'compass' }, { title: 'Account', path: '/account', icon: 'user' },
];
export function Shell({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions(); const mobile = width < 760; const path = usePathname(); const insets = useSafeAreaInsets();
  const { rental, storageError } = useApp();
  return <View style={[styles.root, { paddingTop: insets.top }]}>
    <View style={[styles.header, { paddingHorizontal: mobile ? 20 : 40 }]}>
      <Pressable accessibilityRole="link" accessibilityLabel="RainBorrow home" onPress={() => router.replace('/')} style={s.row}><View style={styles.logo}><Icon name="umbrella" color="white" size={23} /></View><T style={styles.brand}>rainborrow<T style={{ fontSize: 22, color: c.green }}>.</T></T></Pressable>
      {!mobile && <View style={{ flexDirection: 'row', gap: 32 }}>{tabs.slice(0, 3).map(tab => <Pressable key={tab.path} accessibilityRole="link" onPress={() => router.replace(tab.path)} style={[styles.nav, path === tab.path && { borderBottomColor: c.green }]}><T style={{ fontFamily: path === tab.path ? f.bold : f.medium, color: path === tab.path ? c.green : c.muted }}>{tab.title}</T>{tab.path === '/rentals' && rental && <View style={styles.dot} />}</Pressable>)}</View>}
      <View style={[s.row, { gap: 18 }]}><Pill tone="orange">DEMO</Pill>{!mobile && <Pressable accessibilityRole="link" accessibilityLabel="Your account" onPress={() => router.replace('/account')} style={styles.avatar}><Icon name="user" size={19} /></Pressable>}</View>
    </View>
    {storageError && <View style={{ backgroundColor: c.orangeLight, padding: 8 }}><T style={{ textAlign: 'center', fontSize: 12 }}>Device storage is unavailable. Demo progress may not survive a refresh.</T></View>}
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.content, { paddingHorizontal: mobile ? 18 : 40, paddingTop: mobile ? 23 : 32, paddingBottom: mobile ? 30 : 26 }]} keyboardShouldPersistTaps="handled">
      <View style={{ width: '100%', maxWidth: 1440, alignSelf: 'center' }}>{children}
        <View style={[styles.footer, mobile && { alignItems: 'flex-start', gap: 6, flexDirection: 'column' }]}><T style={{ fontSize: 11, color: c.muted }}>A little shared shelter. A better way to get around.</T><T style={{ fontSize: 10, color: c.muted }}>Demo stations & pricing · No real charges</T></View>
      </View>
    </ScrollView>
    {mobile && <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 10) }]}>{tabs.map(tab => <Pressable accessibilityRole="link" accessibilityLabel={tab.title} key={tab.path} onPress={() => router.replace(tab.path)} style={styles.bottomItem}><Icon name={tab.icon} color={path === tab.path ? c.green : c.muted} size={21} /><T style={{ fontSize: 10, color: path === tab.path ? c.green : c.muted, fontFamily: path === tab.path ? f.bold : f.medium }}>{tab.title}</T></Pressable>)}</View>}
  </View>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: c.cream }, header: { height: 80, backgroundColor: c.paper, borderBottomWidth: 1, borderBottomColor: c.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 20 },
  brand: { fontFamily: f.bold, fontSize: 23, letterSpacing: -1 }, logo: { height: 38, width: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: c.green },
  nav: { height: 80, borderBottomWidth: 2, borderBottomColor: 'transparent', justifyContent: 'center', flexDirection: 'row', alignItems: 'center', gap: 7 }, avatar: { height: 38, width: 38, borderRadius: 19, backgroundColor: c.sage, alignItems: 'center', justifyContent: 'center' },
  content: { flexGrow: 1 }, dot: { width: 6, height: 6, backgroundColor: c.green, borderRadius: 3 },
  footer: { marginTop: 26, paddingTop: 18, borderTopWidth: 1, borderTopColor: c.line, flexDirection: Platform.OS === 'web' ? 'row' : 'column', alignItems: 'center', justifyContent: 'space-between' },
  bottom: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: c.line, backgroundColor: c.paper, paddingTop: 12 }, bottomItem: { flex: 1, alignItems: 'center', gap: 5, minHeight: 43 },
});
