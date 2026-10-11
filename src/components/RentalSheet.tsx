import { RentalCooldownNotice } from './RentalCooldownNotice';
import React, { useEffect, useState } from 'react';
import { BackHandler, Platform, Pressable, ScrollView, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../context/AppContext';
import { Button, Icon, IconButton, Pill, s, T } from './ui';
import { REWARD_NOTICE } from './Rewards';
import { formatMinutes, MINUTE, rewardBalance, rewardDate, rewardEstimate } from '../lib/rewards';
import { colors as c, fonts as f } from '../theme';

export function RentalSheet() {
  const { sheet } = useApp();
  if (!sheet) return null;
  return <RentalDialog key={`${sheet.kind}-${sheet.stationId || sheet.receipt?.id || ''}`} />;
}
function RentalDialog() {
  const app = useApp(); const { width, height } = useWindowDimensions(); const mobile = width < 600;
  const [name, setName] = useState(app.name); const [error, setError] = useState(''); const [confirmed, setConfirmed] = useState(false);
  const sheet = app.sheet; const station = app.stations.find(s => s.id === sheet?.stationId);
  const close = () => app.setSheet(null);
  const setSheet = app.setSheet;
  useEffect(() => {
    const back = BackHandler.addEventListener('hardwareBackPress', () => { setSheet(null); return true; });
    function keydown(event: KeyboardEvent) { if (event.key === 'Escape') setSheet(null); }
    if (Platform.OS === 'web') window.addEventListener('keydown', keydown);
    return () => { back.remove(); if (Platform.OS === 'web') window.removeEventListener('keydown', keydown); };
  }, [setSheet]);
  function start() {
    if (!station) return;
    try { app.startRental(station.id, name); close(); app.setSelectedStationId(null); router.replace('/'); } catch (e) { setError(e instanceof Error ? e.message : 'Please try again.'); }
  }
  function finish() {
    if (!station || !confirmed || !app.rental) return;
    try { const receipt = app.returnRental(station.id, app.rental.id); app.setSheet({ kind: 'receipt', receipt }); } catch (e) { setError(e instanceof Error ? e.message : 'Please try again.'); }
  }

  if (!sheet) return null;
  if (sheet.kind === 'return' && station) {
    const compact = height < 700;
    const landscape = width >= 600 && height < 600;
    const minutes = rewardEstimate(station, app.rental, app.credits, app.now);
    return <View style={[StyleSheet.absoluteFill, styles.backdrop]}>
      <Pressable accessibilityLabel="Close dialog" onPress={close} style={StyleSheet.absoluteFill} />
      <View role="dialog" aria-label="Return umbrella" style={[styles.dialog, { width: landscape ? Math.min(width - 32, 760) : mobile ? width - 28 : 430, padding: compact ? 12 : 16, gap: compact ? 6 : 10 }]}>
        <View style={s.between}><Pill tone="orange">DEMO RETURN</Pill><IconButton icon="x" label="Close rental dialog" onPress={close} style={{ width: 34, height: 34 }} /></View>
        <View style={{ flexDirection: landscape ? 'row' : 'column', gap: compact ? 8 : 10 }}>
          <View style={{ gap: compact ? 6 : 8, ...(landscape ? { flex: 1 } : {}) }}>
            <View style={{ gap: 3 }}><T style={{ fontFamily: f.display, fontSize: 23, lineHeight: 27 }}>Return your umbrella</T><T style={{ fontSize: 13, lineHeight: 18 }}>{station.name} · {station.capacity - station.available} free slots</T></View>
            <View style={{ backgroundColor: c.cream, borderRadius: 9, padding: 8, gap: 3 }}>
              <T style={{ fontSize: 12, lineHeight: 16, fontFamily: f.semibold }}>{minutes > 0 ? `Earn ${minutes} extra free minutes` : 'No extra reward for this return'}</T>
              <T style={{ fontSize: 11, lineHeight: 15, color: c.muted }}>{REWARD_NOTICE}</T>
            </View>
            <View style={{ gap: compact ? 4 : 6 }}>
              <T style={{ fontSize: 12, lineHeight: 17 }}><T style={{ fontFamily: f.bold, fontSize: 12 }}>1. Find an empty slot.</T> {station.landmark}</T>
              <T style={{ fontSize: 12, lineHeight: 17 }}><T style={{ fontFamily: f.bold, fontSize: 12 }}>2. Insert the umbrella.</T> Push until the lock clicks.</T>
              <T style={{ fontSize: 12, lineHeight: 17 }}><T style={{ fontFamily: f.bold, fontSize: 12 }}>3. Wait for confirmation.</T> The station lock ends your rental.</T>
            </View>
          </View>
          <View style={{ gap: 8, justifyContent: 'flex-end', flexShrink: 0, ...(landscape ? { flex: 1 } : {}) }}>
            {error ? <T accessibilityRole="alert" style={{ color: c.red, fontSize: 12, lineHeight: 16 }}>{error}</T> : null}
            <Pressable accessibilityRole="checkbox" accessibilityLabel="Simulate the umbrella being securely locked into the station" accessibilityState={{ checked: confirmed }} onPress={() => setConfirmed(!confirmed)} style={[s.row, { minHeight: 44 }]}><View style={[styles.checkbox, confirmed && { backgroundColor: c.green, borderColor: c.green }]}>{confirmed && <Icon name="check" size={14} color="white" />}</View><T style={{ flex: 1, fontSize: 12, lineHeight: 17 }}>Simulate the umbrella being securely locked into the station.</T></Pressable>
            <Button title="Confirm demo return" disabled={!confirmed} onPress={finish} icon="check" />
          </View>
        </View>
      </View>
    </View>;
  }
  return <View style={[StyleSheet.absoluteFill, styles.backdrop]}><Pressable accessibilityLabel="Close dialog" onPress={close} style={StyleSheet.absoluteFill} /><View role="dialog" aria-label="Rental details" style={[styles.dialog, { width: mobile ? width - 28 : 470, maxHeight: '94%' }]}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: mobile ? 23 : 30, gap: 18 }}>
    <View style={s.between}><Pill tone="orange">DEMO EXPERIENCE</Pill><IconButton icon="x" label="Close rental dialog" onPress={close} /></View>
    {sheet.kind === 'receipt' && sheet.receipt ? <>
      <View style={{ alignItems: 'center', gap: 12 }}><View style={styles.success}><Icon name="check" color={c.green} size={32} /></View><T style={[s.title, { fontSize: 32 }]}>{sheet.receipt.status === 'owned' ? 'This umbrella is yours.' : 'All returned. All good.'}</T><T style={[s.muted, { textAlign: 'center' }]}>{sheet.receipt.status === 'owned' ? 'Your HK$60 deposit is fully used. No return is required and deductions have stopped.' : sheet.receipt.refundAmount !== undefined ? 'Your unused deposit is refunded in this demo.' : 'Your umbrella is ready for its next adventure.'}</T></View>
      {!!sheet.receipt.rewardMinutesEarned && <View style={styles.summary}><T style={{ fontFamily: f.bold, fontSize: 18 }}>Umbrella returned! You earned {sheet.receipt.rewardMinutesEarned} extra free minutes.</T><T style={s.muted}>Use them on future rentals. Expires {rewardDate(sheet.receipt.rewardExpiresAt!)}.</T><T>{formatMinutes(rewardBalance(app.credits, app.now))} free minutes available now</T></View>}
      <View style={styles.summary}><Summary label="Extra free time used" value={`${formatMinutes((sheet.receipt.rewardMsUsed || 0) / MINUTE)} min`} /><Summary label="Borrowed from" value={sheet.receipt.stationName} /><Summary label={sheet.receipt.status === 'owned' ? 'Outcome' : 'Returned to'} value={sheet.receipt.status === 'owned' ? 'Umbrella owned by you' : sheet.receipt.returnStationName || ''} /><Summary label="Umbrella" value={sheet.receipt.umbrellaId} /><Summary label="Rental duration" value={`${Math.max(1, Math.ceil(((sheet.receipt.returnedAt || sheet.receipt.ownedAt || 0) - sheet.receipt.startedAt) / 60000))} min`} /><View style={styles.rule} />{sheet.receipt.depositPaid !== undefined && <Summary label="Demo deposit paid" value={`HK$${sheet.receipt.depositPaid}.00`} />}<Summary label={sheet.receipt.depositPaid !== undefined ? "Deposit used" : "Demo total"} value={`HK$${sheet.receipt.amount || 0}.00`} />{sheet.receipt.refundAmount !== undefined && <Summary label="Demo refund" value={`HK$${sheet.receipt.refundAmount}.00`} />}</View><T style={{ textAlign: 'center', fontSize: 12, color: c.muted }}>No payment was taken. Your receipt is saved in My rentals.</T><Button title="View my rentals" onPress={() => { close(); router.replace('/rentals'); }} />
    </> : sheet.kind === 'borrow' && station ? <>
      <RentalCooldownNotice />
      <View style={{ gap: 5 }}><T style={s.label}>REVIEW YOUR RENTAL</T><T style={[s.title, { fontSize: 32 }]}>Let’s get you covered.</T><T style={s.muted}>{station.name} · {station.available} umbrellas available</T></View>
      <View style={styles.summary}><Summary label="Extra free minutes available" value={`${formatMinutes(rewardBalance(app.credits, app.now))} min · applied automatically`} /><Summary label="Upfront deposit" value="HK$60" /><Summary label="Free rental" value="First 12 hours" /><Summary label="After free time" value="HK$5 / completed hour" /><Summary label="When HK$60 is used" value="The umbrella is yours" /><Summary label="Return location" value="Any available station" /><View style={styles.rule} /><View style={s.row}><Icon name="credit-card" color={c.green} /><View style={{ flex: 1 }}><T style={{ fontFamily: f.semibold }}>Demo payment method</T><T style={{ color: c.muted, fontSize: 11, marginTop: 4 }}>HK$60 deposit simulated. No real money collected.</T></View></View></View>
      <View style={{ gap: 8 }}><T style={{ fontFamily: f.semibold, fontSize: 12 }}>What should we call you?</T><TextInput accessibilityLabel="Your name" style={s.input} placeholder="Your first name" placeholderTextColor={c.muted} value={name} onChangeText={setName} maxLength={40} autoComplete="given-name" /></View><T style={{ color: c.muted, fontSize: 11, lineHeight: 17 }}>This creates a local demo profile, not a signed-in account. Your 12 free hours start after the simulated umbrella removal. Wait 1 hour after each rental ends before borrowing again. Reward minutes extend free time. HK$5 is deducted after each completed paid hour. Return earlier for the unused deposit; once all HK$60 is used, the umbrella is yours.</T><Button title="Simulate HK$60 deposit & unlock" disabled={app.cooldownRemaining > 0} icon="unlock" onPress={start} />
    </> : null}
    {error ? <T accessibilityRole="alert" style={{ color: c.red, fontSize: 12, lineHeight: 18 }}>{error}</T> : null}
  </ScrollView></View></View>;
}
function Summary({ label, value }: { label: string; value: string }) { return <View style={[s.between, { alignItems: 'flex-start' }]}><T style={{ fontSize: 12, color: c.muted, flex: 1 }}>{label}</T><T style={{ fontSize: 12, fontFamily: f.semibold, flex: 1, textAlign: 'right' }}>{value}</T></View>; }
const styles = StyleSheet.create({ backdrop: { flex: 1, backgroundColor: '#102D2570', alignItems: 'center', justifyContent: 'center' }, dialog: { borderRadius: 25, backgroundColor: c.paper, overflow: 'hidden' }, summary: { borderRadius: 15, backgroundColor: c.cream, padding: 20, gap: 16 }, rule: { height: 1, backgroundColor: c.line }, number: { width: 30, height: 30, borderRadius: 10, backgroundColor: c.sage, alignItems: 'center', justifyContent: 'center' }, checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center' }, success: { height: 68, width: 68, borderRadius: 34, backgroundColor: c.mint, alignItems: 'center', justifyContent: 'center' } });
