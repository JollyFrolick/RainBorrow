import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './map.css';
import { DEMO_CENTER } from '../data/stations';
import { canUseStation, stationCount } from '../lib/rental';
import { StationMapProps } from './StationMap.types';
import { IconButton, T } from './ui';
import { colors as c } from '../theme';

export default function StationMap({ stations, selectedId, onSelect, location, mode, centerRequest, onLocate, locating }: StationMapProps) {
  const element = useRef<HTMLDivElement>(null); const map = useRef<L.Map | null>(null); const markers = useRef<L.LayerGroup | null>(null); const user = useRef<L.LayerGroup | null>(null);
  const select = useRef(onSelect);
  useEffect(() => { select.current = onSelect; }, [onSelect]);
  const [mapError, setMapError] = useState(false);
  useEffect(() => {
    if (!element.current) return;
    const instance = L.map(element.current, { zoomControl: false, scrollWheelZoom: false, attributionControl: true }).setView([22.2835, 114.1565], 15);
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 19 }).addTo(instance);
    tiles.on('tileerror', () => setMapError(true)); tiles.on('tileload', () => setMapError(false));
    markers.current = L.layerGroup().addTo(instance); user.current = L.layerGroup().addTo(instance); map.current = instance;
    let lastCenter = instance.getCenter();
    instance.on('moveend', () => { lastCenter = instance.getCenter(); });
    const observer = new ResizeObserver(() => {
      if (!element.current?.clientWidth || !element.current?.clientHeight) return;
      const center = lastCenter;
      instance.invalidateSize({ pan: false });
      instance.setView(center, instance.getZoom(), { animate: false });
    }); observer.observe(element.current);
    return () => { observer.disconnect(); instance.remove(); map.current = null; };
  }, []);
  useEffect(() => {
    const layer = markers.current; if (!layer) return; layer.clearLayers();
    stations.forEach(station => {
      const selected = station.id === selectedId; const available = canUseStation(station, mode);
      const html = `<div class="station-marker ${selected ? 'selected' : ''} ${available ? '' : 'unavailable'}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 12a10 10 0 0 1 20 0H2Z"/><path d="M12 12v7a3 3 0 0 0 6 0"/></svg><span>${stationCount(station, mode)}</span></div>`;
      const marker = L.marker([station.latitude, station.longitude], { icon: L.divIcon({ html, className: 'station-pin', iconSize: [62, 43], iconAnchor: [31, 43] }), title: `${station.name}: ${stationCount(station, mode)} ${mode === 'borrow' ? 'umbrellas' : 'return slots'}`, keyboard: true, zIndexOffset: selected ? 1000 : 0 }).on('click', () => select.current(station.id)).addTo(layer);
      marker.bindTooltip(station.name, { direction: 'top', offset: [0, -40], className: 'station-tooltip' });
    });
  }, [stations, selectedId, mode]);
  useEffect(() => { const selected = stations.find(s => s.id === selectedId); if (selected) map.current?.panTo([selected.latitude, selected.longitude], { animate: true }); }, [selectedId, stations]);
  useEffect(() => {
    user.current?.clearLayers(); if (!location || !user.current) return;
    L.circleMarker([location.latitude, location.longitude], { radius: 9, color: 'white', weight: 3, fillColor: '#5484D5', fillOpacity: 1 }).bindTooltip('Your location').addTo(user.current);
  }, [location]);
  useEffect(() => { if (centerRequest && location) map.current?.setView([location.latitude, location.longitude], 15); }, [centerRequest, location]);
  return <View style={{ flex: 1, backgroundColor: '#E8EDE3', position: 'relative', minHeight: 280 }}>
    <div ref={element} aria-label="Map of demo umbrella stations in Hong Kong" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
    <View style={{ position: 'absolute', right: 16, top: 16, gap: 7 }}><IconButton icon="plus" label="Zoom in" onPress={() => map.current?.zoomIn()} /><IconButton icon="minus" label="Zoom out" onPress={() => map.current?.zoomOut()} /><IconButton icon="navigation" label={locating ? 'Finding your location' : 'Show my location'} onPress={onLocate} /><IconButton icon="maximize" label="Show all demo stations" onPress={() => { if (stations.length) map.current?.fitBounds(stations.map(s => [s.latitude, s.longitude] as L.LatLngTuple), { padding: [60, 60] }); else map.current?.setView([DEMO_CENTER.latitude, DEMO_CENTER.longitude], 15); }} /></View>
    {mapError && <View style={{ position: 'absolute', bottom: 24, left: 14, right: 65, backgroundColor: c.paper, borderRadius: 8, padding: 10 }}><T style={{ fontSize: 12 }}>Map tiles are unavailable. You can still choose a station from the list.</T></View>}
  </View>;
}
