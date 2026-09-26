import React, { useMemo, useState } from 'react';
import { Keyboard, Linking, Pressable, ScrollView, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Icon, IconButton, Pill, s, T } from '../components/ui';
import StationMap from '../components/StationMap';
import { useApp, DEMO_CENTER } from '../context/AppContext';
import { colors as c, fonts as f } from '../theme';
import { canUseStation, distanceMeters, formatDistance, isOpen, stationCount } from '../lib/rental';
import type { Station } from '../data/stations';

export default function MapScreen() {
  const app = useApp(); const { width, height } = useWindowDimensions(); const mobile = width < 760;
  const [query, setQuery] = useState(''); const [selectedId, setSelected] = useState<string | null>(null);
  const [saved, setSaved] = useState(false); const [listOpen, setListOpen] = useState(false); const [centerRequest, setCenterRequest] = useState(0);
  const [directionsError, setDirectionsError] = useState('');
  const stations = useMemo(() => app.stations.filter(station => (!saved || app.favorites.includes(station.id)) && `${station.name} ${station.district} ${station.address} ${station.id} Hong Kong`.toLowerCase().includes(query.toLowerCase().trim())).sort((a, b) => Number(canUseStation(b, app.mode)) - Number(canUseStation(a, app.mode)) || distanceMeters(app.location || DEMO_CENTER, a) - distanceMeters(app.location || DEMO_CENTER, b)), [app.stations, app.favorites, app.location, app.mode, saved, query]);
  const selected = stations.find(station => station.id === selectedId);
  async function locate() { setListOpen(false); setSelected(null); await app.getLocation(); setCenterRequest(n => n + 1); }
  function choose(id: string) { setSelected(id); setDirectionsError(''); setListOpen(false); Keyboard.dismiss(); }
  async function directions() {
    if (!selected) return;
    try { await Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}&travelmode=walking`); }
    catch { setDirectionsError('Directions could not open. Try your maps app with the address above.'); }
  }
  return <View style={styles.root}>
    <StationMap stations={stations} selectedId={selected?.id || null} onSelect={choose} location={app.location} mode={app.mode} centerRequest={centerRequest} onLocate={locate} locating={app.locationLoading} controlsTop={mobile ? 145 : 22} bottomInset={mobile && selected ? 285 : 40} />
    <View pointerEvents="box-none" style={[styles.top, { right: mobile ? 14 : undefined, width: mobile ? undefined : 390 }]}>
      <View style={styles.search}>
        <View style={styles.logo}><Icon name="umbrella" color="white" size={21} /></View>
        <TextInput accessibilityLabel="Search stations or areas" value={query} onFocus={() => setListOpen(true)} onChangeText={value => { setQuery(value); setListOpen(true); }} placeholder="Find an umbrella station" placeholderTextColor={c.muted} style={styles.searchInput} />
        {query ? <IconButton icon="x" label="Clear search" onPress={() => setQuery('')} style={styles.smallButton} /> : <Icon name="search" size={19} color={c.muted} />}
      </View>
      <View style={styles.tools}>
        <View style={styles.segment}>{(['borrow', 'return'] as const).map(mode => <Pressable key={mode} accessibilityRole="tab" accessibilityLabel={mode === 'borrow' ? 'Borrow' : 'Return'} accessibilityState={{ selected: app.mode === mode }} onPress={() => app.setMode(mode)} style={[styles.segmentItem, app.mode === mode && styles.segmentActive]}><Icon name={mode === 'borrow' ? 'umbrella' : 'corner-down-left'} size={14} color={app.mode === mode ? '#fff' : c.green} /><T style={{ fontFamily: f.semibold, fontSize: 12, color: app.mode === mode ? '#fff' : c.green }}>{mode === 'borrow' ? 'Borrow' : 'Return'}</T></Pressable>)}</View>
        <Pressable accessibilityRole="button" accessibilityLabel={listOpen ? 'Hide station list' : 'Show station list'} accessibilityState={{ expanded: listOpen }} onPress={() => { setListOpen(!listOpen); Keyboard.dismiss(); }} style={styles.listButton}><Icon name={listOpen ? 'x' : 'list'} size={16} /><T style={{ fontFamily: f.semibold, fontSize: 12 }}>Stations</T></Pressable>
      </View>
      {app.rental && !listOpen && <Pressable accessibilityRole="button" accessibilityLabel="View active rental" onPress={() => router.replace('/rentals')} style={styles.activeBanner}><Icon name="umbrella" size={17} /><T style={{ flex: 1, fontSize: 12, fontFamily: f.semibold }}>Rental active · View or return</T><Icon name="arrow-right" size={16} /></Pressable>}
      {(app.locationError || app.locationLoading) && <View style={styles.notice}><T accessibilityRole="alert" style={{ fontSize: 12, lineHeight: 18 }}>{app.locationLoading ? 'Finding your current location…' : app.locationError}</T></View>}
      {listOpen && <View style={[styles.stationList, { maxHeight: Math.max(160, height - 300) }]}>
        <View style={[s.between, { padding: 16 }]}><View><T style={{ fontFamily: f.bold }}>{saved ? 'Saved stations' : 'Nearby stations'} ({stations.length})</T><T style={{ fontSize: 10, color: c.muted, marginTop: 4 }}>{app.location ? 'From your location' : 'Around Central · demo area'}</T></View><IconButton icon="bookmark" label={saved ? 'Show all stations' : 'Show saved stations'} onPress={() => setSaved(!saved)} style={saved ? { backgroundColor: c.mint } : undefined} /></View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 12, gap: 7 }}>
          {stations.length ? stations.map(station => <StationRow key={station.id} station={station} onPress={() => choose(station.id)} />) : <View style={{ padding: 18, gap: 12 }}><T style={{ fontFamily: f.semibold }}>No stations found</T><T style={{ color: c.muted, fontSize: 12 }}>Try another area or view all demo stations.</T><Button secondary title="Show all stations" onPress={() => { setQuery(''); setSaved(false); }} /></View>}
        </ScrollView>
      </View>}
    </View>
    {!listOpen && <View pointerEvents="box-none" style={[styles.bottom, { right: mobile ? 14 : undefined, width: mobile ? undefined : 390 }]}>
      {selected ? <View style={[styles.details, { maxHeight: Math.max(190, height - 265) }]}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 18, gap: 13 }}>
          <View style={s.between}><View style={{ flex: 1, gap: 4 }}><T style={styles.eyebrow}>{selected.district} · {selected.id}</T><T style={{ fontSize: 21, fontFamily: f.bold }}>{selected.name}</T></View><IconButton icon="x" label="Close station details" onPress={() => setSelected(null)} style={styles.smallButton} /></View>
          <T style={{ fontSize: 12, lineHeight: 18, color: c.muted }}>{selected.landmark}</T>
          <View style={[s.row, { flexWrap: 'wrap', gap: 12 }]}><Pill tone={canUseStation(selected, app.mode) ? 'green' : 'orange'}>{stationStatus(selected, app.mode)}</Pill><T style={{ fontSize: 11, color: c.muted }}>{selected.hours}</T></View>
          <View style={s.row}><Button title={app.mode === 'return' ? app.rental ? 'Return here' : 'Rent an umbrella first' : app.rental ? 'View rental' : 'Rent here · HK$5/hr'} icon={app.mode === 'return' ? 'corner-down-left' : 'maximize'} style={{ flex: 1, paddingHorizontal: 12 }} disabled={!canUseStation(selected, app.mode) || (app.mode === 'return' && !app.rental)} onPress={() => { if (app.mode === 'return') app.setSheet({ kind: 'return', stationId: selected.id }); else if (app.rental) router.replace('/rentals'); else router.replace({ pathname: '/scan', params: { stationId: selected.id } }); }} /><IconButton icon="navigation" label="Walking directions" onPress={directions} /><IconButton icon="bookmark" label={app.favorites.includes(selected.id) ? 'Unsave station' : 'Save station'} onPress={() => app.toggleFavorite(selected.id)} style={app.favorites.includes(selected.id) ? { backgroundColor: c.mint } : undefined} /></View>
          {directionsError ? <T style={{ color: c.red, fontSize: 12 }}>{directionsError}</T> : null}
        </ScrollView>
      </View> : <View pointerEvents="none" style={styles.mapHint}><Icon name="map-pin" size={16} /><T style={{ fontSize: 12, fontFamily: f.medium }}>Tap a station to {app.mode === 'borrow' ? 'find an umbrella' : 'find a return slot'}</T></View>}
      <T pointerEvents="none" style={styles.demoNote}>Demo stations · No real rentals or charges</T>
    </View>}
  </View>;
}
function stationStatus(station: Station, mode: 'borrow' | 'return') {
  return station.status === 'offline' ? 'Temporarily offline' : !isOpen(station) ? 'Closed now' : `${stationCount(station, mode)} ${mode === 'borrow' ? 'umbrellas' : 'return slots'} available`;
}
function StationRow({ station, onPress }: { station: Station; onPress: () => void }) {
  const { mode, location } = useApp();
  return <Pressable accessibilityRole="button" accessibilityLabel={`Select ${station.name}`} onPress={onPress} style={styles.stationRow}>
    <View style={s.between}><T style={{ fontFamily: f.semibold, flex: 1 }}>{station.name}</T><Icon name="chevron-right" size={17} /></View>
    <T style={{ fontSize: 11, color: c.muted, marginTop: 5 }}>{formatDistance(distanceMeters(location || DEMO_CENTER, station))}{location ? ' away' : ' from demo centre'} · {stationStatus(station, mode)}</T>
  </Pressable>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#E8EDE3' },
  top: { position: 'absolute', top: 16, left: 14, gap: 10, zIndex: 10 },
  search: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, backgroundColor: c.paper, borderRadius: 18, borderWidth: 1, borderColor: c.line, boxShadow: '0 4px 20px #15382c12' },
  logo: { width: 35, height: 35, borderRadius: 12, backgroundColor: c.green, alignItems: 'center', justifyContent: 'center' },
  searchInput: { flex: 1, minWidth: 0, fontFamily: f.medium, fontSize: 13, color: c.ink, paddingVertical: 17 },
  smallButton: { width: 32, height: 32, borderWidth: 0, backgroundColor: 'transparent' },
  tools: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  segment: { flex: 1, flexDirection: 'row', padding: 4, borderRadius: 14, backgroundColor: c.paper, borderWidth: 1, borderColor: c.line },
  segmentItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: 34, borderRadius: 10, gap: 6 },
  segmentActive: { backgroundColor: c.green },
  listButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, minHeight: 44, paddingHorizontal: 14, backgroundColor: c.paper, borderRadius: 14, borderWidth: 1, borderColor: c.line },
  stationList: { backgroundColor: c.paper, borderRadius: 18, borderWidth: 1, borderColor: c.line, overflow: 'hidden', boxShadow: '0 8px 24px #15382c18' },
  stationRow: { padding: 14, backgroundColor: c.cream, borderRadius: 12 },
  notice: { padding: 12, borderRadius: 12, backgroundColor: c.paper },
  activeBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.mint, borderWidth: 1, borderColor: '#C5D5B8', borderRadius: 13, padding: 13 },
  bottom: { position: 'absolute', bottom: 24, left: 14, gap: 8, zIndex: 5 },
  details: { backgroundColor: c.paper, borderRadius: 20, borderWidth: 1, borderColor: c.line, boxShadow: '0 6px 28px #15382c20', overflow: 'hidden' },
  eyebrow: { fontFamily: f.medium, fontSize: 10, color: c.muted, textTransform: 'uppercase', letterSpacing: .7 },
  mapHint: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, padding: 13, borderRadius: 12, backgroundColor: c.paper, borderWidth: 1, borderColor: c.line },
  demoNote: { fontSize: 10, color: c.greenDark, alignSelf: 'flex-start', backgroundColor: '#FFFFFFE8', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
});
