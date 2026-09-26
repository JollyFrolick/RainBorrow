import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { StationMapProps } from './StationMap.types';
import { colors as c, fonts as f } from '../theme';
import { canUseStation, stationCount } from '../lib/rental';
import { Icon, IconButton, T } from './ui';

export default function StationMap({ stations, selectedId, onSelect, location, mode, centerRequest, onLocate, controlsTop = 12, bottomInset = 40 }: StationMapProps) {
  const ref = useRef<MapView>(null);
  useEffect(() => { const s = stations.find(s => s.id === selectedId); if (s) ref.current?.animateToRegion({ latitude: s.latitude, longitude: s.longitude, latitudeDelta: .014, longitudeDelta: .014 }); }, [selectedId, stations]);
  useEffect(() => { if (location && centerRequest) ref.current?.animateToRegion({ ...location, latitudeDelta: .014, longitudeDelta: .014 }); }, [location, centerRequest]);
  return <View style={{ flex: 1, minHeight: 280 }}><MapView ref={ref} style={StyleSheet.absoluteFill} mapPadding={{ top: controlsTop, bottom: bottomInset, left: 15, right: 15 }} initialRegion={{ latitude: 22.2835, longitude: 114.1565, latitudeDelta: .014, longitudeDelta: .014 }} showsUserLocation={!!location} showsMyLocationButton={false}>
    {stations.map(station => <Marker key={station.id} coordinate={station} title={station.name} onPress={() => onSelect(station.id)}><View style={{ backgroundColor: selectedId === station.id ? c.green : c.paper, padding: 9, borderRadius: 12, borderWidth: 1, borderColor: c.line, flexDirection: 'row', gap: 6, opacity: canUseStation(station, mode) ? 1 : .5 }}><Icon name="umbrella" size={16} color={selectedId === station.id ? '#fff' : c.green} /><T style={{ fontFamily: f.bold, color: selectedId === station.id ? '#fff' : c.green }}>{stationCount(station, mode)}</T></View></Marker>)}
  </MapView><View style={{ position: 'absolute', right: 14, top: controlsTop, gap: 8 }}><IconButton icon="navigation" label="Show my location" onPress={onLocate} /><IconButton icon="maximize" label="Show all stations" onPress={() => { if (stations.length) ref.current?.fitToCoordinates(stations, { edgePadding: { top: controlsTop + 30, bottom: bottomInset, left: 50, right: 50 }, animated: true }); }} /></View></View>;
}
