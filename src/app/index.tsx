import { RentalCooldownNotice } from '../components/RentalCooldownNotice';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, Linking, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Icon, IconButton, Pill, s, T } from '../components/ui';
import StationMap from '../components/StationMap';
import { useApp, DEMO_CENTER } from '../context/AppContext';
import { colors as c, fonts as f } from '../theme';
import { canUseStation, distanceMeters, formatDistance, stationCount } from '../lib/rental';
import { ActiveRentalBanner } from '../components/ActiveRentalBanner';
import { RewardEstimate, REWARD_NOTICE } from '../components/Rewards';
import { rewardMarker, stationSymbol } from '../lib/stationMarker';
import { REWARD_CONFIG, rewardEstimate } from '../lib/rewards';
import type { Station } from '../data/stations';

export default function MapScreen() {
  const app = useApp(); const { width, height } = useWindowDimensions(); const mobile = width < 760;
  const selectedId = app.selectedStationId; const setSelected = app.setSelectedStationId;
  const insets = useSafeAreaInsets();
  const navigationInset = 68 + Math.max(insets.bottom, 8);
  const [centerRequest, setCenterRequest] = useState(0);
  const [directionsError, setDirectionsError] = useState('');
  const stations = app.stations;
  const rewardMinutes = useMemo(() => Object.fromEntries(app.stations.map(station => [station.id, app.mode === 'return' ? rewardEstimate(station, app.rental, app.credits, app.now) : 0])), [app.stations, app.mode, app.rental, app.credits, app.now]);
  const trackEstimate = app.trackRewardEstimate;
  useEffect(() => { stations.forEach(station => { if (rewardMinutes[station.id] > 0) trackEstimate(station.id, rewardMinutes[station.id]); }); }, [stations, rewardMinutes, trackEstimate]);
  const selected = stations.find(station => station.id === selectedId);
  async function locate() { setSelected(null); await app.getLocation(); setCenterRequest(n => n + 1); }
  function choose(id: string) { setSelected(id); setDirectionsError(''); }
  async function directions() {
    if (!selected) return;
    try { await Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}&travelmode=walking`); }
    catch { setDirectionsError('Directions could not open. Try your maps app with the address above.'); }
  }
  return <View style={styles.root}>
    <StationMap rewardMinutes={rewardMinutes} stations={stations} selectedId={selected?.id || null} onSelect={choose} location={app.location} mode={app.mode} centerRequest={centerRequest} onLocate={locate} locating={app.locationLoading} controlsTop={insets.top + (mobile && app.rental ? 142 : mobile && app.cooldownRemaining > 0 ? 239 : 22)} bottomInset={(mobile && selected ? 300 : 28) + navigationInset} />
    {!app.rental && <View pointerEvents="none" style={[styles.brand, { top: insets.top + 16 }]}>
      <View style={styles.brandBadge}>
        <Image source={require('../../assets/rainborrow-logo.png')} accessibilityLabel="RainBorrow logo" style={styles.brandLogo} resizeMode="contain" />
        <T style={styles.brandName}>RainBorrow</T>
      </View>
    </View>}
    <View pointerEvents="box-none" style={[styles.top, { top: insets.top + (app.rental ? 12 : 80), right: mobile ? 14 : undefined, width: mobile ? undefined : 390 }]}>
      <RentalCooldownNotice />
      {app.rental && <ActiveRentalBanner rental={app.rental} credits={app.credits} />}
      {app.rental && app.mode === 'return' && <View style={styles.notice}><T style={{ fontSize: 11, lineHeight: 16 }}>{REWARD_NOTICE}</T></View>}
      {(app.locationError || app.locationLoading) && <View style={styles.notice}><T accessibilityRole="alert" style={{ fontSize: 12, lineHeight: 18 }}>{app.locationLoading ? 'Finding your current location…' : app.locationError}</T></View>}
    </View>
    <View pointerEvents="box-none" style={[styles.bottom, { bottom: navigationInset + 4, right: mobile ? 14 : undefined, width: mobile ? undefined : 390 }]}>
      {selected ? <View style={[styles.details, { maxHeight: Math.min(300, Math.max(160, height - insets.top - navigationInset - (app.rental ? 220 : 180))) }]}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 12, gap: 8 }}>
          <View style={s.between}><View style={{ flex: 1, gap: 2 }}><T style={styles.eyebrow}>{selected.district} · {selected.id}</T><T style={{ fontSize: 18, fontFamily: f.bold }}>{selected.name}</T></View><IconButton icon="x" label="Close station details" onPress={() => setSelected(null)} style={styles.smallButton} /></View>
          <T style={{ fontSize: 12, lineHeight: 16, color: c.muted }}>{selected.landmark}</T>
          <View style={[s.row, { flexWrap: 'wrap', gap: 12 }]}><Pill tone={canUseStation(selected, app.mode) ? 'green' : 'orange'}>{stationStatus(selected, app.mode)}</Pill><T style={{ fontSize: 11, color: c.muted }}>24/7 · {formatDistance(distanceMeters(app.location || DEMO_CENTER, selected))}{app.location ? ' away' : ' from demo centre'}</T></View>
          {app.mode === 'return' && <RewardEstimate station={selected} details />}
          <View style={s.row}><Button title={app.mode === 'return' ? app.rental ? 'Return here' : 'Rent an umbrella first' : app.rental ? 'View rental' : app.cooldownRemaining > 0 ? `Rent again in ${Math.ceil(app.cooldownRemaining / 60000)} min` : 'Rent here · 12h free'} icon={app.mode === 'return' ? 'corner-down-left' : 'maximize'} style={{ flex: 1, paddingHorizontal: 12 }} disabled={(app.mode === 'borrow' && app.cooldownRemaining > 0) || !canUseStation(selected, app.mode) || (app.mode === 'return' && !app.rental)} onPress={() => { if (app.mode === 'return') app.setSheet({ kind: 'return', stationId: selected.id }); else if (app.rental) router.replace('/rentals'); else router.replace({ pathname: '/scan', params: { stationId: selected.id } }); }} /><IconButton icon="navigation" label="Walking directions" onPress={directions} /><IconButton icon="bookmark" label={app.favorites.includes(selected.id) ? 'Unsave station' : 'Save station'} onPress={() => app.toggleFavorite(selected.id)} style={app.favorites.includes(selected.id) ? { backgroundColor: c.mint } : undefined} /></View>
          {app.mode === 'return' && !canUseStation(selected, 'return') && <Button secondary title="Find another return station" onPress={() => { setSelected(null); }} />}
          {directionsError ? <T style={{ color: c.red, fontSize: 12 }}>{directionsError}</T> : null}
        </ScrollView>
      </View> : <View pointerEvents="none" style={styles.mapHint}><Icon name="map-pin" size={12} /><T style={{ fontSize: 11, lineHeight: 14, fontFamily: f.medium }}>{app.mode === 'borrow' ? 'Tap a station to borrow' : 'Tap a station to return'}</T></View>}
      <View pointerEvents="none" style={{ backgroundColor: c.paper, paddingVertical: 5, paddingHorizontal: 8, borderRadius: 8, gap: 4 }}>
        <T style={{ fontSize: 11 }}>{stationSymbol(app.mode)} {app.mode === 'return' ? 'Available return slots' : 'Available umbrellas'}</T>
        {app.mode === 'return' && <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>{[REWARD_CONFIG.criticalMinutes, REWARD_CONFIG.lowMinutes, 0].map(minutes => { const reward = rewardMarker(minutes); return <View key={minutes} style={[s.row, { gap: 5 }]}><View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: reward.color, borderWidth: 1, borderColor: c.muted }} /><T style={{ fontSize: 10 }}>{reward.label}</T></View>; })}</View>}
      </View>
      <T pointerEvents="none" style={styles.demoNote}>Demo stations · No real rentals or charges</T>
    </View>
  </View>;
}
function stationStatus(station: Station, mode: 'borrow' | 'return') {
  return station.status === 'offline' ? 'Temporarily offline' : `${stationCount(station, mode)} ${mode === 'borrow' ? 'umbrellas' : 'return slots'} available`;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#E8EDE3' },
  brand: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 10 },
  brandBadge: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 8, paddingHorizontal: 15, borderRadius: 28, backgroundColor: c.paper, borderWidth: 1, borderColor: c.line, boxShadow: '0 2px 12px #15382c15' },
  brandLogo: { width: 32, height: 32 },
  brandName: { fontFamily: f.bold, fontSize: 19, color: c.greenDark },
  top: { position: 'absolute', top: 16, left: 14, gap: 6, zIndex: 10 },
  smallButton: { width: 32, height: 32, borderWidth: 0, backgroundColor: 'transparent' },
  notice: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 9, backgroundColor: c.paper },
  bottom: { position: 'absolute', bottom: 24, left: 14, gap: 4, zIndex: 5 },
  details: { backgroundColor: c.paper, borderRadius: 14, borderWidth: 1, borderColor: c.line, boxShadow: '0 6px 28px #15382c20', overflow: 'hidden' },
  eyebrow: { fontFamily: f.medium, fontSize: 10, color: c.muted, textTransform: 'uppercase', letterSpacing: .7 },
  mapHint: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 3, paddingHorizontal: 7, borderRadius: 6, backgroundColor: c.paper, borderWidth: 1, borderColor: c.line },
  demoNote: { fontSize: 10, color: c.greenDark, alignSelf: 'flex-start', backgroundColor: '#FFFFFFE8', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
});
