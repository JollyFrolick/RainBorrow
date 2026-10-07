import type { Coordinate, Station } from '../data/stations';

export type Rental = { id: string; umbrellaId: string; stationId: string; stationName: string; startedAt: number; returnedAt?: number; returnStationId?: string; returnStationName?: string; amount?: number; rewardMinutesEarned?: number; rewardMsUsed?: number; rewardExpiresAt?: number };
export type Mode = 'borrow' | 'return';
export const PRICE_PER_HOUR = 5;
export const DAILY_CAP = 30;
export function priceForDuration(milliseconds: number): number {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) return 0;
  const days = Math.floor(milliseconds / 86400000);
  const remainder = milliseconds % 86400000;
  return days * DAILY_CAP + Math.min(Math.ceil(remainder / 3600000) * PRICE_PER_HOUR, DAILY_CAP);
}
export function distanceMeters(from: Coordinate, to: Coordinate): number {
  const rad = Math.PI / 180;
  const a = Math.sin((to.latitude - from.latitude) * rad / 2) ** 2 + Math.cos(from.latitude * rad) * Math.cos(to.latitude * rad) * Math.sin((to.longitude - from.longitude) * rad / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
export function formatDistance(meters: number) { return meters < 1000 ? `${Math.round(meters / 10) * 10} m` : `${(meters / 1000).toFixed(1)} km`; }
export function stationCount(station: Station, mode: Mode) { return mode === 'borrow' ? station.available : station.capacity - station.available; }
export function canUseStation(station: Station, mode: Mode) { return station.capacity > 0 && station.available >= 0 && station.available <= station.capacity && station.status === 'online' && stationCount(station, mode) > 0; }
export function elapsedLabel(milliseconds: number) { const seconds = Math.max(0, Math.floor(milliseconds / 1000)); return `${Math.floor(seconds / 3600).toString().padStart(2, '0')}:${Math.floor(seconds / 60 % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`; }
export function parseStationCode(input: string): string | null { const match = input.trim().toUpperCase().match(/(?:^|[/=?])((?:RB-)?\d{3})(?:$|[&#/])/); return match ? `RB-${match[1].replace('RB-', '')}` : null; }
