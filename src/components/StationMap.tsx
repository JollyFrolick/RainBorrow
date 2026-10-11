import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { StationMapProps } from './StationMap.types';
import { colors as c, fonts as f } from '../theme';
import { canUseStation, stationCount } from '../lib/rental';
import { rewardMarker, stationSymbol } from '../lib/stationMarker';
import { IconButton, T } from './ui';

export default function StationMap({ rewardMinutes = {}, stations, selectedId, onSelect, location, mode, centerRequest, onLocate, controlsTop = 12, bottomInset = 40 }: StationMapProps) {
  const ref = useRef<MapView>(null);
  useEffect(() => { if (location && centerRequest) ref.current?.animateToRegion({ ...location, latitudeDelta: .014, longitudeDelta: .014 }); }, [location, centerRequest]);
  return <View style={{ flex: 1, minHeight: 280 }}><MapView ref={ref} style={StyleSheet.absoluteFill} mapPadding={{ top: controlsTop, bottom: bottomInset, left: 15, right: 15 }} initialRegion={{ latitude: 22.2835, longitude: 114.1565, latitudeDelta: .014, longitudeDelta: .014 }} showsUserLocation={!!location} showsMyLocationButton={false} moveOnMarkerPress={false}>
    {stations.map(station => {
      const reward = rewardMarker(rewardMinutes[station.id] || 0);
      const label = `${station.name}: ${stationCount(station, mode)} ${mode === 'return' ? 'return slots' : 'umbrellas'} available${mode === 'return' ? ` · ${reward.label}` : ''}${canUseStation(station, mode) ? '' : ' · Unavailable'}`;
      return <Marker key={station.id} coordinate={station} accessibilityLabel={label} onPress={() => onSelect(station.id)}><View style={{ backgroundColor: mode === 'return' ? reward.color : '#FFFFFF', padding: 9, borderRadius: 12, borderWidth: 2, borderColor: selectedId === station.id ? c.greenDark : c.line, flexDirection: 'row', alignItems: 'center', gap: 6, opacity: canUseStation(station, mode) ? 1 : .5 }}><T style={{ fontSize: 17 }}>{stationSymbol(mode)}</T><T style={{ fontFamily: f.bold, color: c.greenDark }}>{stationCount(station, mode)}</T></View></Marker>;
    })}
  </MapView><View style={{ position: 'absolute', right: 14, top: controlsTop, gap: 8 }}><IconButton icon="navigation" label="Show my location" onPress={onLocate} /><IconButton icon="maximize" label="Show all stations" onPress={() => { if (stations.length) ref.current?.fitToCoordinates(stations, { edgePadding: { top: controlsTop + 30, bottom: bottomInset, left: 50, right: 50 }, animated: true }); }} /></View></View>;
}
