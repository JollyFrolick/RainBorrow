import React from 'react';
import { View } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors as c, fonts as f } from '../theme';
import { Button, T } from './ui';

export function RentalCooldownNotice() {
  const { cooldownRemaining, rental, bypassDemoCooldown } = useApp();
  if (rental || cooldownRemaining <= 0) return null;
  return <View style={{ padding: 12, borderRadius: 12, backgroundColor: c.paper, gap: 5 }}>
    <T style={{ fontFamily: f.semibold }}>Rent again in {Math.ceil(cooldownRemaining / 60000)} min</T>
    <T style={{ fontSize: 12, lineHeight: 18, color: c.muted }}>There is a 1-hour cooldown after returning an umbrella or keeping it once the deposit is fully used.</T>
    <Button secondary title="Demo: skip cooldown" icon="fast-forward" onPress={bypassDemoCooldown} style={{ marginTop: 7 }} />
  </View>;
}
