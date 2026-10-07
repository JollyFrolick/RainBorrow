import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { colors as c } from '../theme';
import { canUseStation } from '../lib/rental';
import { Icon, IconName } from './ui';

export function BottomNavigation() {
  const path = usePathname(); const insets = useSafeAreaInsets(); const app = useApp(); const { setSheet } = app;
  function navigate(destination: '/' | '/scan' | '/account' | '/rentals') {
    setSheet(null);
    if (path !== destination) router.replace(destination);
  }
  const selected = path === '/' ? app.stations.find(station => station.id === app.selectedStationId) : undefined;
  const viewRental = !!selected || !!app.rental;
  const centralDisabled = !!selected && !app.rental && !canUseStation(selected, 'borrow');
  function centralAction() {
    if (app.rental) navigate('/rentals');
    else if (selected) setSheet({ kind: 'borrow', stationId: selected.id });
    else navigate('/scan');
  }
  const profileActive = ['/account', '/rentals', '/how-it-works'].includes(path);
  return <View pointerEvents="box-none" testID="bottom-navigation" style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
    <View pointerEvents="box-none" style={styles.items}>
      <NavItem label="Map" icon="map" active={path === '/'} onPress={() => navigate('/')} />
      <Pressable accessibilityRole="button" accessibilityLabel={viewRental ? 'View rental' : 'Scan to rent'} accessibilityHint={selected && !app.rental ? `Review borrowing at ${selected.name}` : undefined} accessibilityState={{ selected: path === '/scan' || path === '/rentals', disabled: centralDisabled }} disabled={centralDisabled} onPress={centralAction} style={styles.scanItem}>
        <View style={[styles.scanIcon, viewRental && { backgroundColor: c.greenDark }, centralDisabled && { opacity: .45 }]}><Icon name="maximize" color="white" size={28} /></View>
      </Pressable>
      <NavItem label="Profile" icon="user" active={profileActive} onPress={() => navigate('/account')} />
    </View>
  </View>;
}
function NavItem({ label, icon, active, onPress }: { label: string; icon: IconName; active: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: active }} onPress={onPress} style={styles.item}>
    <View style={styles.iconCircle}><Icon name={icon} size={22} color={active ? c.green : c.muted} /></View>
    {active && <View style={styles.indicator} />}
  </Pressable>;
}
const styles = StyleSheet.create({
  bar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'transparent', paddingTop: 8, zIndex: 30 },
  items: { width: '100%', maxWidth: 480, alignSelf: 'center', flexDirection: 'row', alignItems: 'center' },
  item: { flex: 1, minWidth: 0, minHeight: 60, alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 2 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #15382c18' },
  scanItem: { flex: 1, minWidth: 0, minHeight: 60, justifyContent: 'center', alignItems: 'center', gap: 5, paddingHorizontal: 2 },
  scanIcon: { width: 54, height: 54, borderRadius: 19, backgroundColor: c.green, justifyContent: 'center', alignItems: 'center' },
  indicator: { position: 'absolute', bottom: 0, width: 4, height: 4, borderRadius: 2, backgroundColor: c.green },
});
