import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Coordinate, DEMO_CENTER, DEMO_STATIONS, Station } from '../data/stations';
import { canUseStation, Mode, priceForDuration, Rental } from '../lib/rental';

type Stored = { stations: Station[]; rental: Rental | null; history: Rental[]; name: string; favorites: string[]; reports: { id: string; note: string; createdAt: number }[] };
type Sheet = { kind: 'borrow' | 'return' | 'receipt'; stationId?: string; receipt?: Rental } | null;
type AppValue = Stored & {
  ready: boolean; location: Coordinate | null; locationLoading: boolean; locationError: string | null;
  mode: Mode; setMode: (m: Mode) => void; sheet: Sheet; setSheet: (s: Sheet) => void;
  getLocation: () => Promise<void>; startRental: (id: string, name: string) => Rental;
  returnRental: (id: string) => Rental; toggleFavorite: (id: string) => void;
  saveName: (name: string) => void; report: (note: string) => void; storageError: boolean;
};
const Context = createContext<AppValue | null>(null);
const KEY = 'rainborrow-demo-v1';
const initial: Stored = { stations: DEMO_STATIONS, rental: null, history: [], name: '', favorites: [], reports: [] };

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Stored>(initial);
  const ref = useRef(state);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [mode, setMode] = useState<Mode>('borrow');
  const [sheet, setSheet] = useState<Sheet>(null);
  const [location, setLocation] = useState<Coordinate | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const writeQueue = useRef(Promise.resolve());
  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(KEY).then(raw => {
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.stations) || !Array.isArray(parsed.history) || !Array.isArray(parsed.favorites) || !Array.isArray(parsed.reports) || typeof parsed.name !== 'string') throw new Error('Invalid data');
      if (mounted) { ref.current = parsed; setState(parsed); }
    }).catch(() => { if (mounted) setStorageError(true); }).finally(() => { if (mounted) setReady(true); });
    return () => { mounted = false; };
  }, []);
  function update(next: Stored) {
    ref.current = next; setState(next);
    writeQueue.current = writeQueue.current.then(() => AsyncStorage.setItem(KEY, JSON.stringify(next))).catch(() => setStorageError(true));
  }
  async function getLocation() {
    setLocationLoading(true); setLocationError(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') throw new Error('Location is off. You can still search for a station or explore the Hong Kong demo.');
      const result = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('We couldn’t find your location. Try again or search an area.')), 15000)),
      ]);
      setLocation({ latitude: result.coords.latitude, longitude: result.coords.longitude });
    } catch (error) { setLocationError(error instanceof Error ? error.message : 'Location is unavailable. Search an area instead.'); }
    finally { setLocationLoading(false); }
  }
  function startRental(id: string, name: string) {
    const current = ref.current;
    if (current.rental) throw new Error('You already have an umbrella. Return it before borrowing another.');
    const station = current.stations.find(s => s.id === id);
    if (!station || !canUseStation(station, 'borrow')) throw new Error('This station is no longer available. Please choose another.');
    const rental: Rental = { id: `RB${Date.now()}`, umbrellaId: `U-${Math.random().toString(36).slice(2, 7).toUpperCase()}`, stationId: id, stationName: station.name, startedAt: Date.now() };
    update({ ...current, name: name.trim() || 'Rain explorer', rental, stations: current.stations.map(s => s.id === id ? { ...s, available: s.available - 1 } : s) });
    return rental;
  }
  function returnRental(id: string) {
    const current = ref.current;
    if (!current.rental) throw new Error('There is no active umbrella rental.');
    const station = current.stations.find(s => s.id === id);
    if (!station || !canUseStation(station, 'return')) throw new Error('This station cannot accept returns. Please choose another.');
    const returnedAt = Date.now();
    const receipt = { ...current.rental, returnedAt, returnStationId: station.id, returnStationName: station.name, amount: priceForDuration(returnedAt - current.rental.startedAt) };
    update({ ...current, rental: null, history: [receipt, ...current.history], stations: current.stations.map(s => s.id === id ? { ...s, available: s.available + 1 } : s) });
    setMode('borrow'); return receipt;
  }
  const value: AppValue = { ...state, ready, location, locationLoading, locationError, mode, setMode, sheet, setSheet, getLocation, startRental, returnRental, storageError,
    toggleFavorite(id) { const cur = ref.current; update({ ...cur, favorites: cur.favorites.includes(id) ? cur.favorites.filter(x => x !== id) : [...cur.favorites, id] }); },
    saveName(name) { update({ ...ref.current, name: name.trim() }); },
    report(note) { const cur = ref.current; update({ ...cur, reports: [{ id: `HELP-${Date.now()}`, note, createdAt: Date.now() }, ...cur.reports] }); },
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useApp() { const value = useContext(Context); if (!value) throw new Error('Missing AppProvider'); return value; }
export { DEMO_CENTER };
