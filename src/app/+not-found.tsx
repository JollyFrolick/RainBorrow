import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Shell } from '../components/Shell';
import { Button, T, s, UmbrellaArt } from '../components/ui';
export default function NotFound() { return <Shell><View style={{ alignItems: 'center', paddingVertical: 70, gap: 18 }}><UmbrellaArt /><T style={s.title}>A little off the map.</T><T>This page doesn’t exist. Let’s find you some shelter.</T><Button title="Back to Explore" onPress={() => router.replace('/')} /></View></Shell>; }
