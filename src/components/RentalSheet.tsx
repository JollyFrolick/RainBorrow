import React, { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import Svg, { Rect } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import { Button, Icon, IconButton, Pill, s, T, UmbrellaArt } from './ui';
import { colors as c, fonts as f } from '../theme';
import { parseStationCode } from '../lib/rental';

export function RentalSheet() {
  const { sheet } = useApp();
  if (!sheet) return null;
  return <RentalDialog key={`${sheet.kind}-${sheet.stationId || sheet.receipt?.id || ''}`} />;
}
function RentalDialog() {
  const app = useApp(); const { width, height } = useWindowDimensions(); const mobile = width < 600;
  const [step, setStep] = useState<'review' | 'scan'>('review'); const [name, setName] = useState(app.name); const [code, setCode] = useState(app.sheet?.stationId || ''); const [error, setError] = useState(''); const [confirmed, setConfirmed] = useState(false); const [camera, setCamera] = useState(false); const [permission, requestPermission] = useCameraPermissions();
  const sheet = app.sheet; const station = app.stations.find(s => s.id === sheet?.stationId);
  const close = () => app.setSheet(null);
  function start(input = code) {
    if (!station) return; const parsed = parseStationCode(input);
    if (parsed !== station.id) { setError(`Enter this station’s code: ${station.id}.`); setCamera(false); return; }
    try { app.startRental(station.id, name); close(); router.replace('/rentals'); } catch (e) { setError(e instanceof Error ? e.message : 'Please try again.'); }
  }
  function finish() {
    if (!station || !confirmed) return;
    try { const receipt = app.returnRental(station.id); app.setSheet({ kind: 'receipt', receipt }); } catch (e) { setError(e instanceof Error ? e.message : 'Please try again.'); }
  }
  async function enableCamera() { try { const result = permission?.granted ? permission : await requestPermission(); if (result.granted) setCamera(true); else setError('Camera access is off. Enter the station code instead.'); } catch { setError('Camera is unavailable. Enter the station code instead.'); } }
  if (!sheet) return null;
  return <Modal visible transparent animationType="fade" onRequestClose={close}><View style={styles.backdrop}><Pressable accessibilityLabel="Close dialog" onPress={close} style={StyleSheet.absoluteFill} /><View accessibilityViewIsModal style={[styles.dialog, { width: mobile ? width - 28 : 470, maxHeight: height - 64 }]}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: mobile ? 23 : 30, gap: 18 }}>
    <View style={s.between}><Pill tone="orange">DEMO EXPERIENCE</Pill><IconButton icon="x" label="Close rental dialog" onPress={close} /></View>
    {sheet.kind === 'receipt' && sheet.receipt ? <>
      <View style={{ alignItems: 'center', gap: 12 }}><View style={styles.success}><Icon name="check" color={c.green} size={32} /></View><T style={[s.title, { fontSize: 32 }]}>All returned. All good.</T><T style={[s.muted, { textAlign: 'center' }]}>Your umbrella is ready for its next adventure.</T></View>
      <View style={styles.summary}><Summary label="Borrowed from" value={sheet.receipt.stationName} /><Summary label="Returned to" value={sheet.receipt.returnStationName || ''} /><Summary label="Umbrella" value={sheet.receipt.umbrellaId} /><Summary label="Rental duration" value={`${Math.max(1, Math.ceil(((sheet.receipt.returnedAt || 0) - sheet.receipt.startedAt) / 60000))} min`} /><View style={styles.rule} /><Summary label="Demo total" value={`HK$${sheet.receipt.amount || 0}.00`} /></View><T style={{ textAlign: 'center', fontSize: 12, color: c.muted }}>No payment was taken. Your receipt is saved in My rentals.</T><Button title="View my rentals" onPress={() => { close(); router.replace('/rentals'); }} />
    </> : sheet.kind === 'return' && station ? <>
      <T style={[s.title, { fontSize: 32 }]}>A good place to return.</T><T style={s.muted}>{station.name} · {station.capacity - station.available} free slots</T><View style={{ alignItems: 'center' }}><UmbrellaArt width={150} height={130} /></View>
      {[['1', 'Find an empty slot', station.landmark], ['2', 'Insert the umbrella', 'Push the handle in until the lock clicks.'], ['3', 'Wait for confirmation', 'Your rental ends when the station confirms the lock.']].map(([n, title, text]) => <View key={n} style={[s.row, { alignItems: 'flex-start' }]}><View style={styles.number}><T style={{ fontFamily: f.bold }}>{n}</T></View><View style={{ flex: 1, gap: 4 }}><T style={{ fontFamily: f.semibold }}>{title}</T><T style={{ fontSize: 12, color: c.muted, lineHeight: 18 }}>{text}</T></View></View>)}
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: confirmed }} onPress={() => setConfirmed(!confirmed)} style={[s.row, { paddingVertical: 8 }]}><View style={[styles.checkbox, confirmed && { backgroundColor: c.green, borderColor: c.green }]}>{confirmed && <Icon name="check" size={14} color="white" />}</View><T style={{ flex: 1, fontSize: 12, lineHeight: 18 }}>Simulate the umbrella being securely locked into the station.</T></Pressable><Button title="Confirm demo return" disabled={!confirmed} onPress={finish} icon="check" />
    </> : station && step === 'review' ? <>
      <View style={{ gap: 5 }}><T style={s.label}>01 / REVIEW YOUR RENTAL</T><T style={[s.title, { fontSize: 32 }]}>Let’s get you covered.</T><T style={s.muted}>{station.name} · {station.available} umbrellas available</T></View>
      <View style={styles.summary}><Summary label="Rental price" value="HK$5 / started hour" /><Summary label="Daily maximum" value="HK$30 / 24 hours" /><Summary label="Return location" value="Any available station" /><View style={styles.rule} /><View style={s.row}><Icon name="credit-card" color={c.green} /><View><T style={{ fontFamily: f.semibold }}>Demo payment method</T><T style={{ color: c.muted, fontSize: 11, marginTop: 4 }}>No card details needed. No real charge.</T></View></View></View>
      <View style={{ gap: 8 }}><T style={{ fontFamily: f.semibold, fontSize: 12 }}>What should we call you?</T><TextInput accessibilityLabel="Your name" style={s.input} placeholder="Your first name" placeholderTextColor={c.muted} value={name} onChangeText={setName} maxLength={40} autoComplete="given-name" /></View><T style={{ color: c.muted, fontSize: 11, lineHeight: 17 }}>This creates a local demo profile, not a signed-in account. Billing starts only after the simulated umbrella removal.</T><Button title="Continue to scan" icon="arrow-right" onPress={() => setStep('scan')} />
    </> : station ? <>
      <View style={{ gap: 5 }}><T style={s.label}>02 / SCAN AND GO</T><T style={[s.title, { fontSize: 32 }]}>Your rainy-day plus one.</T><T style={s.muted}>Scan the QR on {station.name}, or enter its code.</T></View>
      <View style={styles.scanner}>{camera && Platform.OS !== 'web' ? <CameraView style={{ width: '100%', height: 205 }} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={({ data }) => { setCamera(false); start(data); }} /> : <><Svg width={104} height={104} viewBox="0 0 100 100">{[[8, 8], [62, 8], [8, 62]].map(([x, y]) => <React.Fragment key={`${x}-${y}`}><Rect x={x} y={y} width="30" height="30" rx="3" fill={c.green} /><Rect x={x + 6} y={y + 6} width="18" height="18" fill="white" /><Rect x={x + 11} y={y + 11} width="8" height="8" fill={c.green} /></React.Fragment>)}{[[48,8],[46,28],[47,47],[62,47],[82,48],[46,66],[65,65],[84,65],[62,85],[82,83]].map(([x,y])=><Rect key={`${x}-${y}`} x={x} y={y} width="9" height="9" fill={c.green} />)}</Svg><T style={{ color: c.muted, fontSize: 11 }}>Illustrative QR · use the demo code below</T></>}</View>
      {Platform.OS !== 'web' && !camera && <Button secondary title="Enable camera" icon="camera" onPress={enableCamera} />}
      <View style={{ gap: 8 }}><T style={{ fontSize: 12, fontFamily: f.semibold }}>Station code</T><TextInput accessibilityLabel="Station code" style={[s.input, { textAlign: 'center', fontFamily: f.bold, letterSpacing: 3 }]} value={code} onChangeText={value => { setCode(value); setError(''); }} autoCapitalize="characters" maxLength={10} /></View><Button title="Simulate scan & unlock" icon="unlock" onPress={() => start()} /><T style={{ color: c.muted, fontSize: 11, textAlign: 'center', lineHeight: 17 }}>This simulates the station unlocking and confirming removal. No physical umbrella will be released.</T>
    </> : null}
    {error ? <T accessibilityRole="alert" style={{ color: c.red, fontSize: 12, lineHeight: 18 }}>{error}</T> : null}
  </ScrollView></View></View></Modal>;
}
function Summary({ label, value }: { label: string; value: string }) { return <View style={[s.between, { alignItems: 'flex-start' }]}><T style={{ fontSize: 12, color: c.muted, flex: 1 }}>{label}</T><T style={{ fontSize: 12, fontFamily: f.semibold, flex: 1, textAlign: 'right' }}>{value}</T></View>; }
const styles = StyleSheet.create({ backdrop: { flex: 1, backgroundColor: '#102D2570', alignItems: 'center', justifyContent: 'center' }, dialog: { borderRadius: 25, backgroundColor: c.paper, overflow: 'hidden' }, summary: { borderRadius: 15, backgroundColor: c.cream, padding: 20, gap: 16 }, rule: { height: 1, backgroundColor: c.line }, scanner: { minHeight: 180, borderWidth: 1, borderStyle: 'dashed', borderColor: '#ABC0A1', borderRadius: 16, backgroundColor: c.cream, justifyContent: 'center', alignItems: 'center', gap: 14, overflow: 'hidden' }, number: { width: 30, height: 30, borderRadius: 10, backgroundColor: c.sage, alignItems: 'center', justifyContent: 'center' }, checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center' }, success: { height: 68, width: 68, borderRadius: 34, backgroundColor: c.mint, alignItems: 'center', justifyContent: 'center' } });
