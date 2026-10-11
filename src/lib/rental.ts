import type { Coordinate, Station } from '../data/stations';

export type Rental = { id: string; umbrellaId: string; stationId: string; stationName: string; startedAt: number; depositPaid?: number; refundAmount?: number; ownedAt?: number; status?: 'returned' | 'owned'; returnedAt?: number; returnStationId?: string; returnStationName?: string; amount?: number; rewardMinutesEarned?: number; rewardMsUsed?: number; rewardExpiresAt?: number };
export type Mode = 'borrow' | 'return';
export const PRICE_PER_HOUR = 5;
export const DEPOSIT = 60;
export const RENTAL_COOLDOWN_MS = 60 * 60 * 1000;
export function rentalCooldownEndsAt(history: Rental[], demoBypassRentalId?: string): number {
  const latest = history.reduce<Rental | undefined>((latest, rental) => {
    const endedAt = rental.returnedAt ?? rental.ownedAt;
    const latestEndedAt = latest?.returnedAt ?? latest?.ownedAt;
    return endedAt !== undefined && (latestEndedAt === undefined || endedAt > latestEndedAt) ? rental : latest;
  }, undefined);
  if (!latest || latest.id === demoBypassRentalId) return 0;
  return (latest.returnedAt ?? latest.ownedAt!) + RENTAL_COOLDOWN_MS;
}
export function assertRentalCooldownEnded(history: Rental[], now: number, demoBypassRentalId?: string): void {
  const remaining = rentalCooldownEndsAt(history, demoBypassRentalId) - now;
  if (remaining > 0) throw new Error(`You can rent another umbrella in ${Math.ceil(remaining / 60000)} min. There is a 1-hour cooldown after each rental ends.`);
}
export function priceForDuration(milliseconds: number): number {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) return 0;
  return Math.min(Math.floor(milliseconds / 3600000) * PRICE_PER_HOUR, DEPOSIT);
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
