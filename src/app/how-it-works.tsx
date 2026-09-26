import React, { useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { Shell } from '../components/Shell';
import { Button, Icon, IconName, s, T, UmbrellaArt } from '../components/ui';
import { colors as c, fonts as f } from '../theme';

const steps: { number: string; icon: IconName; title: string; text: string }[] = [
  { number: '01', icon: 'map-pin', title: 'Find your shelter.', text: 'Open the map, choose Borrow, and find a station with umbrellas available. Check its opening hours and get walking directions.' },
  { number: '02', icon: 'maximize', title: 'Scan. Borrow. Go.', text: 'Tap Scan to rent, scan the station QR or enter its code, then review the price. Your rental begins when the station confirms you’ve taken the umbrella.' },
  { number: '03', icon: 'repeat', title: 'Pass it on.', text: 'Switch to Return to find an available slot. Insert the umbrella, wait for lock confirmation, and get your receipt. Any compatible station works.' },
];
const faqs = [
  ['How much does it cost?', 'The demo rate is HK$5 for each started hour, capped at HK$30 for each 24-hour period. A 61-minute rental is HK$10. These are example prices, and no money is charged in this frontend.'],
  ['Do I return it to the same station?', 'No. Return your umbrella to any online, open station with a free return slot. Choose Return on the Explore screen to check availability.'],
  ['What if a station is full or offline?', 'Choose another station on the map. The app disables returns at full or offline stations. A real-world outage would require station event recovery and customer support; this demo does not release or accept physical umbrellas.'],
  ['Can I use the app without sharing my location?', 'Yes. Browse the Hong Kong demo area or search by station name, address, or neighbourhood. You can choose to share your location later with the map’s location button.'],
  ['Are these real rental stations?', 'No. All station inventory, rental transactions, and prices in this preview are simulated. The landmarks are real places in Hong Kong, but the umbrella stations are fictional.'],
];
export default function HowItWorks() {
  const { width } = useWindowDimensions(); const [open, setOpen] = useState<number | null>(0);
  return <Shell><View style={{ alignItems: 'center', marginBottom: 32, marginTop: 8 }}><T style={s.label}>A BETTER WAY TO WEATHER THE DAY</T><T style={[s.title, { textAlign: 'center', marginTop: 13, fontSize: width < 600 ? 36 : 48, lineHeight: 54 }]}>Borrow a little cover.</T><T style={[s.muted, { textAlign: 'center', marginTop: 9 }]}>Three simple steps. One less thing to carry.</T></View>
    <View style={{ flexDirection: width < 850 ? 'column' : 'row', gap: 20 }}>{steps.map(step => <View key={step.number} style={[s.card, { flex: 1, gap: 19, padding: 28 }]}><View style={s.between}><View style={{ height: 52, width: 52, backgroundColor: c.sage, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }}><Icon name={step.icon} size={24} /></View><T style={{ fontFamily: f.display, fontSize: 28, color: '#BECBBB' }}>{step.number}</T></View><T style={{ fontFamily: f.display, fontSize: 27 }}>{step.title}</T><T style={s.muted}>{step.text}</T></View>)}</View>
    <View style={{ backgroundColor: c.greenDark, borderRadius: 22, marginTop: 24, padding: 28, flexDirection: 'row', alignItems: 'center', gap: 12 }}><View style={{ flex: 1, gap: 10 }}><T style={{ fontFamily: f.display, color: '#fff', fontSize: 30 }}>Rain happens. Keep going.</T><T style={{ color: '#BCCFC1', lineHeight: 20 }}>Your next adventure is just an umbrella away.</T><Button secondary title="Explore the stations" icon="arrow-right" style={{ alignSelf: 'flex-start', marginTop: 6 }} onPress={() => router.replace('/')} /></View>{width > 450 && <UmbrellaArt width={160} height={155} dark />}</View>
    <View style={{ maxWidth: 760, width: '100%', alignSelf: 'center', marginTop: 36, gap: 12 }}><T style={{ fontFamily: f.bold, fontSize: 22, marginBottom: 8 }}>Good questions.</T>{faqs.map(([question, answer], i) => <View key={question} style={[s.card, { padding: 20 }]}><Pressable accessibilityRole="button" accessibilityLabel={question} accessibilityState={{ expanded: open === i }} onPress={() => setOpen(open === i ? null : i)} style={s.between}><T style={{ fontFamily: f.semibold, flex: 1 }}>{question}</T><Icon name={open === i ? 'minus' : 'plus'} size={18} /></Pressable>{open === i && <T style={[s.muted, { marginTop: 14, fontSize: 13 }]}>{answer}</T>}</View>)}</View>
  </Shell>;
}
