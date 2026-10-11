import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Coordinate, DEMO_CENTER, DEMO_STATIONS, Station } from '../data/stations';
import { assertRentalCooldownEnded, canUseStation, DEPOSIT, Mode, Rental, rentalCooldownEndsAt } from '../lib/rental';

import { completeDemoReturn, settleDemoOwnership, type RewardState, type RewardEvent } from '../lib/rewards';

type Stored = RewardState & { name: string; favorites: string[]; reports: { id: string; note: string; createdAt: number }[]; demoCooldownBypassRentalId?: string };
type Sheet = { kind: 'borrow' | 'return' | 'receipt'; stationId?: string; receipt?: Rental } | null;
type AppValue = Stored & {
  ready: boolean; location: Coordinate | null; locationLoading: boolean; locationError: string | null;
  selectedStationId: string | null; setSelectedStationId: (id: string | null) => void;
  mode: Mode; sheet: Sheet; setSheet: (s: Sheet) => void; cooldownRemaining: number; bypassDemoCooldown: () => void;
  getLocation: () => Promise<void>; startRental: (id: string, name: string) => Rental;
  returnRental: (id: string, rentalId: string) => Rental; trackRewardEstimate: (stationId: string, minutes: number) => void; now: number; toggleFavorite: (id: string) => void;
  saveName: (name: string) => void; report: (note: string) => void; storageError: boolean;
};
const Context = createContext<AppValue | null>(null);
const KEY = 'rainborrow-demo-v1';
const initial: Stored = { stations: DEMO_STATIONS, rental: null, history: [], name: '', favorites: [], reports: [], credits: [], rewardEvents: [], stockoutSince: Object.fromEntries(DEMO_STATIONS.filter(s => s.available === 0).map(s => [s.id, Date.now()])) };

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Stored>(initial);
  const ref = useRef(state);
  const [now, setNow] = useState(() => Date.now());
  const cooldownEndsAt = rentalCooldownEndsAt(state.history, state.demoCooldownBypassRentalId);
  const cooldownRemaining = Math.max(0, cooldownEndsAt - now);
  useEffect(() => {
    const remaining = cooldownEndsAt - Date.now();
    if (remaining <= 0) return;
    const timer = setTimeout(() => setNow(Date.now()), remaining);
    return () => clearTimeout(timer);
  }, [cooldownEndsAt]);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(timer); }, []);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const mode: Mode = state.rental ? 'return' : 'borrow';
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
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
      const migrated: Stored = { ...parsed, credits: parsed.credits || [], rewardEvents: parsed.rewardEvents || [], stockoutSince: parsed.stockoutSince || Object.fromEntries(parsed.stations.filter((s: Station) => s.available === 0).map((s: Station) => [s.id, Date.now()])) };
      if (mounted) { const settled = settleDemoOwnership(migrated, Date.now()); ref.current = settled; setState(settled); if (settled !== migrated) writeQueue.current = writeQueue.current.then(() => AsyncStorage.setItem(KEY, JSON.stringify(settled))).catch(() => setStorageError(true)); }
    }).catch(() => { if (mounted) setStorageError(true); }).finally(() => { if (mounted) setReady(true); });
    return () => { mounted = false; };
  }, []);
  function update(next: Stored) {
    ref.current = next; setState(next); setNow(Date.now());
    writeQueue.current = writeQueue.current.then(() => AsyncStorage.setItem(KEY, JSON.stringify(next))).catch(() => setStorageError(true));
  }
  useEffect(() => {
    if (!ready) return;
    const timer = setInterval(() => {
      const current = ref.current;
      const settled = settleDemoOwnership(current, Date.now());
      if (settled !== current) {
        ref.current = settled; setState(settled); setNow(Date.now());
        writeQueue.current = writeQueue.current.then(() => AsyncStorage.setItem(KEY, JSON.stringify(settled))).catch(() => setStorageError(true));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [ready]);
  async function getLocation() {
    setLocationLoading(true); setLocationError(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') throw new Error('Location is off. You can still find stations by browsing the Hong Kong demo map.');
      const result = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('We couldn’t find your location. Try again or browse the map.')), 15000)),
      ]);
      setLocation({ latitude: result.coords.latitude, longitude: result.coords.longitude });
    } catch (error) { setLocationError(error instanceof Error ? error.message : 'Location is unavailable. Browse the map instead.'); }
    finally { setLocationLoading(false); }
  }
  function startRental(id: string, name: string) {
    const current = settleDemoOwnership(ref.current, Date.now());
    if (!ready) throw new Error('Your saved rentals are still loading.');
    if (current.rental) throw new Error('You already have an umbrella. Return it before borrowing another.');
    assertRentalCooldownEnded(current.history, Date.now(), current.demoCooldownBypassRentalId);
    const station = current.stations.find(s => s.id === id);
    if (!station || !canUseStation(station, 'borrow')) throw new Error('This station is no longer available. Please choose another.');
    const rental: Rental = { id: `RB${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, umbrellaId: `U-${Math.random().toString(36).slice(2, 7).toUpperCase()}`, stationId: id, stationName: station.name, startedAt: Date.now(), depositPaid: DEPOSIT };
    update({ ...current, demoCooldownBypassRentalId: undefined, stockoutSince: station.available === 1 ? { ...current.stockoutSince, [id]: rental.startedAt } : current.stockoutSince, name: name.trim() || 'Rain explorer', rental, stations: current.stations.map(s => s.id === id ? { ...s, available: s.available - 1 } : s) });
    return rental;
  }
  function returnRental(id: string, rentalId: string) {
    if (!ready) throw new Error('Your saved rentals are still loading.');
    const result = completeDemoReturn(ref.current, rentalId, id, Date.now());
    if (result.state !== ref.current) update(result.state);
    return result.receipt;
  }
  function trackRewardEstimate(stationId: string, minutes: number) {
    const cur = ref.current;
    if (!ready || !cur.rental || minutes <= 0) return;
    const id = `estimate-${cur.rental.id}-${stationId}-${minutes}`;
    if (cur.rewardEvents.some(e => e.id === id)) return;
    const event: RewardEvent = { id, kind: 'estimate_shown', at: Date.now(), stationId, rentalId: cur.rental.id, minutes };
    update({ ...cur, rewardEvents: [...cur.rewardEvents, event] });
  }
  const value: AppValue = { ...state, now, cooldownRemaining, selectedStationId, setSelectedStationId, trackRewardEstimate, ready, location, locationLoading, locationError, mode, sheet, setSheet, getLocation, startRental, returnRental, storageError,
    bypassDemoCooldown() {
      const current = ref.current;
      if (!ready || current.rental) return;
      const endsAt = rentalCooldownEndsAt(current.history, current.demoCooldownBypassRentalId);
      if (endsAt <= Date.now()) return;
      const latest = current.history.find(rental => rentalCooldownEndsAt([rental]) === endsAt);
      if (latest) update({ ...current, demoCooldownBypassRentalId: latest.id });
    },
    toggleFavorite(id) { const cur = ref.current; update({ ...cur, favorites: cur.favorites.includes(id) ? cur.favorites.filter(x => x !== id) : [...cur.favorites, id] }); },
    saveName(name) { update({ ...ref.current, name: name.trim() }); },
    report(note) { const cur = ref.current; update({ ...cur, reports: [{ id: `HELP-${Date.now()}`, note, createdAt: Date.now() }, ...cur.reports] }); },
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useApp() { const value = useContext(Context); if (!value) throw new Error('Missing AppProvider'); return value; }
export { DEMO_CENTER };
