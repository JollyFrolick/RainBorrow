import React from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { colors as c, fonts as f } from '../theme';
import { Icon, Pill, s, T } from './ui';

/** Scrolling content for secondary screens. Navigation lives in the root layout. */
export function Shell({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  return <View style={styles.root}>
    <View style={[styles.header, { paddingHorizontal: width < 760 ? 18 : 32 }]}>
      <Pressable accessibilityRole="link" accessibilityLabel="Back to map" onPress={() => router.replace('/')} style={s.row}>
        <Icon name="arrow-left" size={20} /><T style={{ fontFamily: f.semibold }}>Back to map</T>
      </Pressable><Pill tone="orange">DEMO</Pill>
    </View>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: width < 760 ? 18 : 32, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
      <View style={{ width: '100%', maxWidth: 1080, alignSelf: 'center' }}>{children}</View>
    </ScrollView>
  </View>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: c.cream },
  header: { height: 62, backgroundColor: c.paper, borderBottomWidth: 1, borderBottomColor: c.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
