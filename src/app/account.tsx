import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { Shell } from '../components/Shell';
import { Button, Icon, Pill, T, useUiStyles } from '../components/ui';
import { useApp } from '../context/AppContext';
import type { Gender } from '../context/AppContext';
import { fonts as f, ThemeColors, useTheme } from '../theme';

const GENDER_OPTIONS: { label: string; value: Gender }[] = [
  { label: 'Woman', value: 'woman' },
  { label: 'Man', value: 'man' },
  { label: 'Non-binary', value: 'non-binary' },
  { label: 'Prefer not to say', value: 'prefer-not-to-say' },
];

export default function Account() {
  const app = useApp(); const { width } = useWindowDimensions(); const [name, setName] = useState(app.name); const [age, setAge] = useState(app.age?.toString() || ''); const [gender, setGender] = useState<Gender | null>(app.gender); const [saved, setSaved] = useState(false); const [note, setNote] = useState(''); const [sent, setSent] = useState(false);
  const c = useTheme(); const s = useUiStyles(); const styles = useMemo(() => createStyles(c), [c]);
  const numericAge = Number(age);
  const ageIsValid = Number.isInteger(numericAge) && numericAge >= 1 && numericAge <= 120;
  const profileIsValid = !!name.trim() && ageIsValid && !!gender;
  const markChanged = () => setSaved(false);
  return <Shell><T style={s.label}>A LITTLE ABOUT YOU</T><T style={[s.title, { marginTop: 10 }]}>Your profile</T><T style={[s.muted, { marginTop: 8, marginBottom: 28 }]}>Your rainy-day essentials, all in one place.</T>
    <View style={{ gap: 10, marginBottom: 24 }}><Button secondary title={app.rental ? "My rentals · Rental active" : "My rentals & receipts"} icon="clock" onPress={() => router.replace('/rentals')} /><Button secondary title="How it works & help" icon="help-circle" onPress={() => router.replace('/how-it-works')} /></View>
    <View style={{ flexDirection: width < 850 ? 'column' : 'row', gap: 24 }}><View style={{ flex: 1, gap: 22 }}>
      <View style={[s.card, { gap: 21 }]}><View style={s.row}><View style={{ height: 58, width: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: c.mint }}><Icon name="user" size={27} /></View><View style={{ gap: 5 }}><T style={{ fontFamily: f.bold, fontSize: 20 }}>{app.name || 'Hello, rain explorer.'}</T><Pill tone="orange">Local demo profile</Pill></View></View>
        <View style={{ gap: 8 }}><T style={styles.fieldLabel}>First name</T><TextInput accessibilityLabel="Profile name" style={s.input} value={name} onChangeText={v => { setName(v); markChanged(); }} maxLength={40} placeholder="Your first name" placeholderTextColor={c.muted} autoComplete="given-name" /></View>
        <View style={{ gap: 8 }}><T style={styles.fieldLabel}>Age</T><TextInput accessibilityLabel="Age" style={s.input} value={age} onChangeText={v => { setAge(v.replace(/\D/g, '')); markChanged(); }} maxLength={3} placeholder="Your age" placeholderTextColor={c.muted} keyboardType="number-pad" inputMode="numeric" />{!!age && !ageIsValid && <T accessibilityRole="alert" style={styles.error}>Enter an age between 1 and 120.</T>}</View>
        <View style={{ gap: 10 }}><T style={styles.fieldLabel}>Gender</T><View accessibilityRole="radiogroup" style={styles.options}>{GENDER_OPTIONS.map(option => { const selected = gender === option.value; return <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={() => { setGender(option.value); markChanged(); }} style={({ pressed }) => [styles.option, selected && styles.optionSelected, pressed && { opacity: .75 }]}><View style={[styles.radio, selected && styles.radioSelected]}>{selected && <View style={styles.radioDot} />}</View><T style={[styles.optionText, selected && { color: c.green }]}>{option.label}</T></Pressable>; })}</View></View>
        <Button title={saved ? 'Profile saved' : 'Save profile'} icon={saved ? 'check' : 'user'} disabled={!profileIsValid} onPress={() => { if (!gender || !ageIsValid) return; app.saveProfile({ name, age: numericAge, gender }); setSaved(true); }} /><T style={{ color: c.muted, fontSize: 11, lineHeight: 17 }}>This profile lives only on this device. Account sign-in and syncing will be connected to the backend.</T></View>
      <View style={[s.card, { gap: 18 }]}><View style={s.row}><Icon name="credit-card" /><T style={{ fontFamily: f.bold, fontSize: 18 }}>Payment method</T></View><View style={[s.between, { backgroundColor: c.cream, borderRadius: 12, padding: 18 }]}><View><T style={{ fontFamily: f.semibold }}>Demo wallet</T><T style={{ fontSize: 12, color: c.muted, marginTop: 5 }}>Ready for simulated rentals</T></View><Pill>No charges</Pill></View><T style={s.muted}>You won’t be asked for card details in this preview.</T></View>
      <View style={[s.card, { gap: 12 }]}><T style={{ fontFamily: f.bold, fontSize: 18 }}>Your shared moments</T><View style={{ flexDirection: 'row', gap: 30 }}><View><T style={{ fontFamily: f.display, fontSize: 38 }}>{app.history.length}</T><T style={{ color: c.muted, fontSize: 12 }}>Completed rentals</T></View><View><T style={{ fontFamily: f.display, fontSize: 38 }}>{app.favorites.length}</T><T style={{ color: c.muted, fontSize: 12 }}>Saved stations</T></View></View></View>
    </View><View style={{ flex: 1, gap: 22 }}>
      <View style={[s.card, { gap: 17 }]}><View style={s.row}><Icon name="life-buoy" /><T style={{ fontFamily: f.bold, fontSize: 18 }}>A little help?</T></View><T style={s.muted}>Umbrella stuck, trouble returning, or something else? Describe what happened.</T><TextInput accessibilityLabel="Describe your issue" multiline style={[s.input, { minHeight: 130, textAlignVertical: 'top' }]} value={note} onChangeText={v => { setNote(v); setSent(false); }} placeholder="Station name, umbrella number, and the issue…" placeholderTextColor={c.muted} maxLength={1000} /><Button title={sent ? 'Saved on this device' : 'Save demo support request'} icon={sent ? 'check' : 'message-circle'} disabled={note.trim().length < 10 || sent} onPress={() => { app.report(note.trim()); setSent(true); }} /><T accessibilityRole={sent ? 'alert' : undefined} style={{ color: c.muted, fontSize: 11, lineHeight: 18 }}>{sent ? 'Your note is saved locally. It has not been sent to a support team.' : 'At least 10 characters. Demo requests are saved locally and are not sent to a support team.'}</T>{app.reports.length > 0 && <T style={{ color: c.green, fontSize: 12 }}>{app.reports.length} request{app.reports.length === 1 ? '' : 's'} saved on this device</T>}</View>
      <View style={[s.card, { gap: 14 }]}><View style={s.row}><Icon name="shield" /><T style={{ fontFamily: f.bold, fontSize: 18 }}>Your location stays yours.</T></View><T style={s.muted}>We ask for your location only when you tap the location button. No background tracking. Prefer not to share? Search the map manually.</T><T style={{ fontSize: 11, color: c.muted, lineHeight: 17 }}>Station availability and prices are examples. Live stations, payments, account authentication, and support require backend integration.</T></View>
    </View></View>
  </Shell>;
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  fieldLabel: { fontSize: 12, fontFamily: f.semibold },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  option: { minHeight: 44, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: c.line, backgroundColor: c.cream, flexDirection: 'row', alignItems: 'center', gap: 8 },
  optionSelected: { borderColor: c.green, backgroundColor: c.sage },
  optionText: { fontSize: 12, fontFamily: f.medium },
  radio: { width: 17, height: 17, borderRadius: 9, borderWidth: 1.5, borderColor: c.muted, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: c.green },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: c.green },
  error: { color: c.red, fontSize: 11 },
});
