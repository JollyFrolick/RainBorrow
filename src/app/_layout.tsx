import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_600SemiBold } from '@expo-google-fonts/dm-sans/600SemiBold';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display/400Regular';
import { AppProvider, useApp } from '../context/AppContext';
import { RentalSheet } from '../components/RentalSheet';
import { BottomNavigation } from '../components/BottomNavigation';
import { T } from '../components/ui';
import { colors } from '../theme';

function Content() {
  const { ready, storageError, sheet } = useApp();
  const insets = useSafeAreaInsets();
  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={colors.green} /></View>;
  return <View style={{ flex: 1, paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right, backgroundColor: colors.cream }}>
    {storageError && <View style={{ backgroundColor: colors.orangeLight, padding: 8 }}><T style={{ textAlign: 'center', fontSize: 12 }}>Device storage is unavailable. Demo progress may not survive a refresh.</T></View>}
    <View style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <View style={{ flex: 1 }} pointerEvents={sheet ? 'none' : 'auto'} aria-hidden={!!sheet} importantForAccessibility={sheet ? 'no-hide-descendants' : 'auto'}>
        <Stack screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: colors.cream } }}>
          <Stack.Screen name="index" options={{ title: 'Map · RainBorrow' }} />
          <Stack.Screen name="scan" options={{ title: 'Scan to rent · RainBorrow' }} />
          <Stack.Screen name="rentals" options={{ title: 'My rentals · RainBorrow' }} />
          <Stack.Screen name="how-it-works" options={{ title: 'How it works · RainBorrow' }} />
          <Stack.Screen name="account" options={{ title: 'Profile · RainBorrow' }} />
          <Stack.Screen name="weather-mode" options={{ title: 'Weather mode · RainBorrow' }} />
        </Stack>
      </View>
      <RentalSheet />
    </View>
    <BottomNavigation />
  </View>;
}
export default function RootLayout() {
  const [loaded, error] = useFonts({ DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold, DMSerifDisplay_400Regular });
  if (!loaded && !error) return <View style={{ flex: 1, backgroundColor: colors.cream, justifyContent: 'center' }}><ActivityIndicator color={colors.green} /></View>;
  return <SafeAreaProvider><AppProvider><StatusBar style="dark" /><Content /></AppProvider></SafeAreaProvider>;
}
