import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { DEPOSIT, elapsedLabel, type Rental } from '../lib/rental';
import { freeRentalEndsAt, rentalBill, type RewardCredit } from '../lib/rewards';
import { colors as c, fonts as f } from '../theme';
import { Icon, T } from './ui';

export function ActiveRentalBanner({ rental, credits }: { rental: Rental; credits: RewardCredit[] }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const remaining = Math.max(0, freeRentalEndsAt(rental, credits) - now);
  return <Pressable accessibilityRole="button" accessibilityLabel="View active rental" onPress={() => router.replace('/rentals')} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: c.mint, borderWidth: 1, borderColor: '#C5D5B8', borderRadius: 13, padding: 13 }}>
    <Icon name="umbrella" size={20} />
    <View style={{ flex: 1, gap: 4 }}><T style={{ fontSize: 13, fontFamily: f.semibold }}>Rental active · View or return</T><T style={{ fontSize: 11, color: c.green }}>{remaining > 0 ? 'Free rental remaining' : `Deposit left: HK$${DEPOSIT - rentalBill(rental, credits, now).amount} · HK$5/hour`}</T></View>
    <T style={{ fontSize: 18, fontFamily: f.bold, fontVariant: ['tabular-nums'] }}>{elapsedLabel(Math.ceil(remaining / 1000) * 1000)}</T>
    <Icon name="arrow-right" size={16} />
  </Pressable>;
}
