import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Shell } from '../components/Shell';
import { Button, Icon, Pill, s, T } from '../components/ui';
import { colors as c } from '../theme';

export default function WeatherMode() {
  return <Shell><View style={{ maxWidth: 460, width: '100%', alignSelf: 'center', alignItems: 'center', paddingVertical: 45, gap: 20 }}>
    <View style={{ width: 104, height: 104, borderRadius: 32, backgroundColor: c.sage, alignItems: 'center', justifyContent: 'center' }}><Icon name="cloud-rain" size={48} /></View>
    <Pill>COMING SOON</Pill><T style={[s.title, { fontSize: 34, textAlign: 'center' }]}>Weather mode</T>
    <T style={[s.muted, { textAlign: 'center' }]}>Weather mode is on the way. It isn’t available yet.</T>
    <T style={{ color: c.muted, textAlign: 'center', lineHeight: 21 }}>For current conditions, tap Weather news in the bottom bar to visit the Hong Kong Observatory.</T>
    <Button title="Back to map" icon="map" onPress={() => router.replace('/')} />
  </View></Shell>;
}
