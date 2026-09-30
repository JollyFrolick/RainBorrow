import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { usePathname } from 'expo-router';
import { fonts as f, useTheme } from '../theme';
import { Icon, T } from './ui';

export function TopBannerAd() {
  const c = useTheme();
  return <View accessibilityLabel="Banner ad placeholder" style={[styles.banner, { backgroundColor: c.paper, borderBottomColor: c.line }]}>
    <View style={[styles.adMark, { borderColor: c.line }]}><T style={{ color: c.muted, fontSize: 9 }}>AD</T></View>
    <Icon name="cloud-rain" size={19} color={c.blue} />
    <View style={{ flexShrink: 1 }}><T numberOfLines={1} style={{ fontFamily: f.semibold, fontSize: 12 }}>Stay ready for sudden showers</T><T numberOfLines={1} style={{ color: c.muted, fontSize: 10 }}>Banner ad placeholder</T></View>
  </View>;
}

export function SettingsExitVideoAd() {
  const c = useTheme();
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const [visible, setVisible] = useState(false);
  const [seconds, setSeconds] = useState(3);

  useEffect(() => {
    const exitedSettings = previousPath.current === '/settings' && pathname !== '/settings';
    previousPath.current = pathname;
    if (exitedSettings) {
      setSeconds(3);
      setVisible(true);
    }
  }, [pathname]);

  useEffect(() => {
    if (!visible || seconds === 0) return;
    const timer = setTimeout(() => setSeconds(value => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, visible]);

  return <Modal visible={visible} transparent animationType="fade" onRequestClose={() => seconds === 0 && setVisible(false)}>
    <View style={styles.overlay}>
      <View accessibilityViewIsModal accessibilityLabel="Video ad placeholder" style={[styles.videoCard, { backgroundColor: c.paper }]}>
        <View style={[styles.video, { backgroundColor: c.greenDark }]}>
          <View style={styles.sponsored}><T style={styles.sponsoredText}>VIDEO AD PLACEHOLDER</T></View>
          <View style={styles.playButton}><Icon name="play" color={c.greenDark} size={32} /></View>
          <T style={styles.videoTitle}>Borrow dry. Arrive happy.</T>
          <T style={styles.videoCopy}>A placeholder for a full-screen video advertisement.</T>
          <View style={styles.progressTrack}><View style={[styles.progress, { width: `${((3 - seconds) / 3) * 100}%` }]} /></View>
        </View>
        <View style={styles.videoFooter}>
          <T style={{ flex: 1, color: c.muted, fontSize: 11 }}>Demo video placement</T>
          <Pressable accessibilityRole="button" disabled={seconds > 0} onPress={() => setVisible(false)} style={[styles.close, { backgroundColor: seconds > 0 ? c.line : c.green }]}>
            <T style={{ color: seconds > 0 ? c.muted : '#fff', fontFamily: f.semibold, fontSize: 12 }}>{seconds > 0 ? `Close in ${seconds}` : 'Close ad'}</T>
          </Pressable>
        </View>
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  banner: { minHeight: 50, paddingHorizontal: 14, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  adMark: { borderWidth: 1, borderRadius: 3, paddingHorizontal: 4, paddingVertical: 2 },
  overlay: { flex: 1, backgroundColor: '#000000B8', alignItems: 'center', justifyContent: 'center', padding: 20 },
  videoCard: { width: '100%', maxWidth: 520, borderRadius: 22, overflow: 'hidden' },
  video: { minHeight: 330, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 28 },
  sponsored: { position: 'absolute', top: 16, left: 16, backgroundColor: '#00000070', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 5 },
  sponsoredText: { color: '#fff', fontFamily: f.semibold, fontSize: 9, letterSpacing: .6 },
  playButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingLeft: 4 },
  videoTitle: { color: '#fff', fontFamily: f.bold, fontSize: 27, textAlign: 'center' },
  videoCopy: { color: '#FFFFFFCC', fontSize: 13, textAlign: 'center' },
  progressTrack: { position: 'absolute', left: 18, right: 18, bottom: 14, height: 4, borderRadius: 2, backgroundColor: '#FFFFFF40', overflow: 'hidden' },
  progress: { height: '100%', backgroundColor: '#fff' },
  videoFooter: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 15 },
  close: { minWidth: 90, minHeight: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
});
