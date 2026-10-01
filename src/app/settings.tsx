import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { Shell } from '../components/Shell';
import { Button, Icon, T, useUiStyles } from '../components/ui';
import { useApp } from '../context/AppContext';
import type { Appearance } from '../context/AppContext';
import type { Mode } from '../lib/rental';
import { fonts as f, ThemeColors, useTheme } from '../theme';

export default function Settings() {
  const app = useApp(); const c = useTheme(); const s = useUiStyles();
  const styles = useMemo(() => createStyles(c), [c]);
  return <Shell><View style={styles.content}>
    <View style={{ gap: 8 }}><T style={s.label}>MAKE IT YOURS</T><T style={[s.title, { fontSize: 36 }]}>Settings</T><T style={s.muted}>Choose how RainBorrow looks and what you see when the map opens.</T></View>

    <View style={[s.card, { gap: 20 }]}>
      <SettingHeading icon="sun" title="Appearance" text="Your choice is saved on this device." />
      <View accessibilityRole="radiogroup" style={styles.segment}>
        {([{ value: 'light', label: 'Light', icon: 'sun' }, { value: 'dark', label: 'Dark', icon: 'moon' }] as const).map(option => {
          const selected = app.appearance === option.value;
          return <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={() => app.setAppearance(option.value as Appearance)} style={[styles.segmentOption, selected && styles.segmentSelected]}><Icon name={option.icon} size={18} color={selected ? c.greenDark : c.ink} /><T style={[styles.segmentLabel, selected && { color: c.greenDark }]}>{option.label}</T></Pressable>;
        })}
      </View>
    </View>

    <View style={[s.card, { gap: 22 }]}>
      <SettingHeading icon="map" title="Map preferences" text="Set the map up for your usual trip." />
      <View style={styles.settingRow}><View style={{ flex: 1, gap: 4 }}><T style={styles.rowTitle}>Default map mode</T><T style={styles.rowText}>Open the map ready to borrow or return.</T></View><View accessibilityRole="radiogroup" style={styles.compactSegment}>{(['borrow', 'return'] as Mode[]).map(mode => <Pressable key={mode} accessibilityRole="radio" accessibilityState={{ checked: app.defaultMode === mode }} onPress={() => app.setDefaultMode(mode)} style={[styles.compactOption, app.defaultMode === mode && styles.compactSelected]}><T style={[styles.compactLabel, app.defaultMode === mode && { color: c.greenDark }]}>{mode === 'borrow' ? 'Borrow' : 'Return'}</T></Pressable>)}</View></View>
      <View style={styles.divider} />
      <View style={styles.settingRow}><View style={{ flex: 1, gap: 4 }}><T style={styles.rowTitle}>Map tips</T><T style={styles.rowText}>Show helpful hints and demo labels on the map.</T></View><Switch accessibilityLabel="Show map tips" value={app.showMapTips} onValueChange={app.setShowMapTips} trackColor={{ false: c.line, true: c.lime }} thumbColor="#fff" /></View>
    </View>

    <View style={[s.card, { gap: 16 }]}>
      <SettingHeading icon="navigation" title="Location" text="RainBorrow only asks for your location when you choose to share it." />
      <Button secondary title={app.locationLoading ? 'Finding your location…' : app.location ? 'Update my location' : 'Share my location'} icon="navigation" loading={app.locationLoading} onPress={app.getLocation} />
      {app.location && <T accessibilityRole="alert" style={styles.success}><Icon name="check-circle" size={14} color={c.green} /> Location is available for nearby stations.</T>}
      {app.locationError && <T accessibilityRole="alert" style={{ color: c.red, fontSize: 12, lineHeight: 18 }}>{app.locationError}</T>}
    </View>

    <T style={{ textAlign: 'center', color: c.muted, fontSize: 11, lineHeight: 17 }}>Preferences are stored only on this device.</T>
  </View></Shell>;
}

function SettingHeading({ icon, title, text }: { icon: React.ComponentProps<typeof Icon>['name']; title: string; text: string }) {
  const c = useTheme(); const s = useUiStyles();
  return <View style={s.row}><View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.sage, alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={21} /></View><View style={{ flex: 1, gap: 3 }}><T style={{ fontFamily: f.bold, fontSize: 17 }}>{title}</T><T style={{ color: c.muted, fontSize: 12, lineHeight: 17 }}>{text}</T></View></View>;
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  content: { width: '100%', maxWidth: 680, alignSelf: 'center', gap: 20 },
  segment: { flexDirection: 'row', gap: 8, padding: 5, borderRadius: 16, backgroundColor: c.cream, borderWidth: 1, borderColor: c.line },
  segmentOption: { flex: 1, minHeight: 48, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  segmentSelected: { backgroundColor: c.lime }, segmentLabel: { fontFamily: f.semibold },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 18 }, rowTitle: { fontFamily: f.semibold, fontSize: 14 }, rowText: { color: c.muted, fontSize: 11, lineHeight: 16 },
  compactSegment: { flexDirection: 'row', padding: 3, borderRadius: 11, backgroundColor: c.cream, borderWidth: 1, borderColor: c.line }, compactOption: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 8 }, compactSelected: { backgroundColor: c.lime }, compactLabel: { fontFamily: f.semibold, fontSize: 11 },
  divider: { height: 1, backgroundColor: c.line }, success: { color: c.green, fontSize: 12, lineHeight: 18 },
});
