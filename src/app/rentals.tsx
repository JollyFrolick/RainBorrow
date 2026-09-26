import React, { useEffect, useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { Shell } from '../components/Shell';
import { Button, Icon, Pill, s, T, UmbrellaArt } from '../components/ui';
import { useApp } from '../context/AppContext';
import { elapsedLabel, priceForDuration } from '../lib/rental';
import { colors as c, fonts as f } from '../theme';

export default function Rentals() {
  const app = useApp(); const { width } = useWindowDimensions(); const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  return <Shell><T style={s.label}>YOUR SHARED ADVENTURES</T><T style={[s.title, { marginTop: 10 }]}>My rentals</T><T style={[s.muted, { marginTop: 8, marginBottom: 28 }]}>A little shelter, from start to finish.</T>
    {app.rental ? <View style={[s.card, { backgroundColor: c.greenDark, padding: width < 600 ? 24 : 36, gap: 22 }]}>
      <View style={s.between}><Pill>RENTAL ACTIVE</Pill><T style={{ color: '#ADCCB5', fontSize: 12 }}>{app.rental.umbrellaId}</T></View>
      <View style={s.between}><View><T style={{ fontFamily: f.display, color: 'white', fontSize: width < 600 ? 32 : 44 }}>You’re covered.</T><T style={{ fontFamily: f.medium, fontSize: width < 600 ? 38 : 56, letterSpacing: 2, color: c.lime, marginTop: 15 }}>{elapsedLabel(now - app.rental.startedAt)}</T><T style={{ color: '#ADCCB5', fontSize: 12, marginTop: 8 }}>Elapsed rental time</T></View><UmbrellaArt width={width < 600 ? 100 : 190} height={width < 600 ? 120 : 160} dark /></View>
      <View style={{ borderTopWidth: 1, borderTopColor: '#416051', paddingTop: 20, flexDirection: width < 600 ? 'column' : 'row', gap: 24 }}><View style={{ flex: 1 }}><T style={{ color: '#ADCCB5', fontSize: 11 }}>BORROWED FROM</T><T style={{ color: 'white', marginTop: 6, fontFamily: f.semibold }}>{app.rental.stationName}</T></View><View style={{ flex: 1 }}><T style={{ color: '#ADCCB5', fontSize: 11 }}>ESTIMATED DEMO CHARGE</T><T style={{ color: 'white', marginTop: 6, fontFamily: f.semibold }}>HK${priceForDuration(now - app.rental.startedAt)}.00 <T style={{ color: '#ADCCB5', fontSize: 11 }}>· HK$30/day maximum</T></T></View></View>
      <Button title="Find a return station" icon="corner-down-left" secondary onPress={() => { app.setMode('return'); router.replace('/'); }} /><T style={{ fontSize: 11, color: '#ADCCB5', textAlign: 'center' }}>Your rental ends after the station confirms the umbrella is locked.</T>
    </View> : <View style={[s.card, { paddingVertical: 40, alignItems: 'center', gap: 12 }]}><UmbrellaArt width={170} height={145} /><T style={{ fontFamily: f.display, fontSize: 29 }}>Ready when the rain is.</T><T style={[s.muted, { textAlign: 'center', maxWidth: 330 }]}>No active rental. Find a nearby station and take a little shelter with you.</T><Button title="Find an umbrella" icon="arrow-right" style={{ marginTop: 8 }} onPress={() => { app.setMode('borrow'); router.replace('/'); }} /></View>}
    <View style={[s.between, { marginTop: 32, marginBottom: 16 }]}><T style={{ fontFamily: f.bold, fontSize: 19 }}>Past rentals</T><Pill tone="gray">{app.history.length} completed</Pill></View>
    {!app.history.length ? <View style={[s.card, { alignItems: 'center', gap: 10, paddingVertical: 30 }]}><Icon name="clock" color={c.muted} size={23} /><T style={{ color: c.muted, fontSize: 13 }}>Your first rainy-day adventure starts here.</T></View> : <View style={{ gap: 12 }}>{app.history.map(rental => <Pressable key={rental.id} accessibilityRole="button" accessibilityLabel={`View receipt from ${rental.stationName}`} onPress={() => app.setSheet({ kind: 'receipt', receipt: rental })} style={[s.card, s.between, { padding: 20 }]}><View style={s.row}><View style={{ width: 42, height: 42, backgroundColor: c.sage, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}><Icon name="umbrella" /></View><View style={{ gap: 5 }}><T style={{ fontFamily: f.semibold, fontSize: 13 }}>{rental.stationName}</T><T style={{ color: c.muted, fontSize: 11 }}>{new Date(rental.startedAt).toLocaleDateString('en-HK', { day: 'numeric', month: 'short' })} · Returned to {rental.returnStationName}</T></View></View><View style={{ alignItems: 'flex-end', gap: 5 }}><T style={{ fontFamily: f.bold }}>HK${rental.amount}.00</T><T style={{ color: c.green, fontSize: 10 }}>View receipt →</T></View></Pressable>)}</View>}
  </Shell>;
}
