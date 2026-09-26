import React, { useRef, useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';
import { router, useIsFocused, useLocalSearchParams } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Shell } from '../components/Shell';
import { Button, Icon, Pill, s, T } from '../components/ui';
import { useApp } from '../context/AppContext';
import { canUseStation, parseStationCode } from '../lib/rental';
import { colors as c, fonts as f } from '../theme';

export default function Scan() {
  const app = useApp(); const params = useLocalSearchParams<{ stationId?: string }>();
  const [code, setCode] = useState(params.stationId || ''); const [error, setError] = useState('');
  const [camera, setCamera] = useState(false); const [permission, requestPermission] = useCameraPermissions();
  const scanning = useRef(false); const focused = useIsFocused();
  const example = app.stations.find(station => canUseStation(station, 'borrow'));
  function scan(input: string) {
    if (scanning.current || app.rental) return;
    scanning.current = true;
    const id = parseStationCode(input); const station = app.stations.find(item => item.id === id);
    setCamera(false);
    if (!station) { setError('Station not found. Enter a code such as RB-001.'); scanning.current = false; return; }
    if (!canUseStation(station, 'borrow')) { setError('This station is closed, offline, or out of umbrellas. Choose another on the map.'); scanning.current = false; return; }
    setError(''); setCode(station.id); app.setSheet({ kind: 'borrow', stationId: station.id });
    scanning.current = false;
  }
  async function enableCamera() {
    try {
      const result = permission?.granted ? permission : await requestPermission();
      if (result.granted) { setError(''); setCamera(true); }
      else setError('Camera access is off. You can enter the station code below.');
    } catch { setError('Camera is unavailable. Enter the station code below.'); }
  }
  return <Shell><View style={styles.content}>
    <View style={{ gap: 8 }}><T style={s.label}>YOUR NEXT UMBRELLA</T><T style={[s.title, { fontSize: 34 }]}>Scan to rent</T><T style={s.muted}>{app.rental ? 'You already have an umbrella out.' : 'At a station? Scan its QR code to get started.'}</T></View>
    {app.rental ? <View style={[s.card, { gap: 18 }]}><Pill>RENTAL ACTIVE</Pill><T style={{ fontFamily: f.semibold }}>Return your current umbrella before renting another.</T><Button title="View my rental" icon="umbrella" onPress={() => router.replace('/rentals')} /><Button secondary title="Find a return station" icon="map" onPress={() => { app.setMode('return'); router.replace('/'); }} /></View> : <>
      <View style={styles.scanner}>
        {camera && focused && !app.sheet && Platform.OS !== 'web' ? <CameraView style={StyleSheet.absoluteFill} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={({ data }) => scan(data)} /> : <><View style={styles.frame}><Icon name="maximize" color={c.lime} size={66} /></View><T style={{ fontFamily: f.semibold, color: 'white', fontSize: 16 }}>Find the QR on the station</T><T style={{ color: '#BCD1C2', fontSize: 12, textAlign: 'center', lineHeight: 18, maxWidth: 260 }}>{Platform.OS === 'web' ? 'Using a laptop? Enter the station code below to try the rental.' : 'Enable your camera, or enter the station code below.'}</T></>}
      </View>
      {Platform.OS !== 'web' && <Button secondary title={camera ? 'Stop camera' : 'Enable camera'} icon="camera" onPress={() => camera ? setCamera(false) : enableCamera()} />}
      <View style={{ gap: 9 }}><T style={{ fontFamily: f.semibold, fontSize: 13 }}>Station code</T><TextInput accessibilityLabel="Station code" style={[s.input, { backgroundColor: c.paper, fontFamily: f.bold, letterSpacing: 2 }]} placeholder="e.g. RB-001" placeholderTextColor={c.muted} value={code} onChangeText={value => { setCode(value); setError(''); }} maxLength={20} autoCapitalize="characters" autoCorrect={false} onSubmitEditing={() => scan(code)} /><Button title="Review rental" icon="arrow-right" disabled={!code.trim()} onPress={() => scan(code)} /></View>
      {error && <T accessibilityRole="alert" style={{ color: c.red, fontSize: 12, lineHeight: 18 }}>{error}</T>}
      {example && <Button secondary title={`Try demo station · ${example.id}`} onPress={() => scan(example.id)} />}
      <T style={{ fontSize: 11, color: c.muted, lineHeight: 18, textAlign: 'center' }}>HK$5 per started hour · HK$30 maximum per 24 hours.{ '\n' }Review the price before unlocking. No real charges in this demo.</T>
    </>}
  </View></Shell>;
}
const styles = StyleSheet.create({
  content: { maxWidth: 460, width: '100%', alignSelf: 'center', gap: 20 },
  scanner: { minHeight: 230, borderRadius: 24, backgroundColor: c.greenDark, justifyContent: 'center', alignItems: 'center', gap: 15, padding: 24, overflow: 'hidden' },
  frame: { width: 96, height: 88, alignItems: 'center', justifyContent: 'center' },
});
