import type { Station } from '../data/stations';
import { canUseStation, DEPOSIT, PRICE_PER_HOUR, priceForDuration, type Rental } from './rental';

export const MINUTE = 60_000;
export type RewardConfig = { criticalThreshold: number; lowThreshold: number; criticalMinutes: number; lowMinutes: number; dailyMinutes: number; expiryDays: number; normalFreeMinutes: number; timeZone: string };
export const REWARD_CONFIG: Readonly<RewardConfig> = Object.freeze({ criticalThreshold: .2, lowThreshold: .4, criticalMinutes: 30, lowMinutes: 15, dailyMinutes: 60, expiryDays: 30, normalFreeMinutes: 12 * 60, timeZone: 'Asia/Hong_Kong' });
export type RewardCredit = { id: string; rentalId: string; umbrellaId: string; stationId: string; stationName: string; earnedAt: number; expiresAt: number; earnedMinutes: number; remainingMs: number };
export type RewardEvent = { id: string; kind: 'estimate_shown' | 'return_completed' | 'minutes_earned' | 'minutes_redeemed' | 'stockout_ended' | 'ownership_transferred'; at: number; stationId: string; rentalId?: string; minutes?: number; durationMs?: number };
export type RewardState = { stations: Station[]; rental: Rental | null; history: Rental[]; credits: RewardCredit[]; rewardEvents: RewardEvent[]; stockoutSince: Record<string, number> };

function day(at: number, config: RewardConfig) { return new Intl.DateTimeFormat('en-CA', { timeZone: config.timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(at); }
export function dailyRemaining(credits: RewardCredit[], now: number, config = REWARD_CONFIG) {
  return Math.max(0, config.dailyMinutes - credits.filter(c => day(c.earnedAt, config) === day(now, config)).reduce((total, c) => total + c.earnedMinutes, 0));
}
export function rewardEstimate(station: Station, rental: Rental | null, credits: RewardCredit[], now: number, config = REWARD_CONFIG) {
  if (!rental || rental.stationId === station.id || station.capacity <= 0 || !canUseStation(station, 'return')) return 0;
  const ratio = station.available / station.capacity;
  const minutes = ratio <= config.criticalThreshold ? config.criticalMinutes : ratio <= config.lowThreshold ? config.lowMinutes : 0;
  return Math.min(minutes, dailyRemaining(credits, now, config));
}
export function rewardBalance(credits: RewardCredit[], now: number) { return credits.filter(c => c.earnedAt <= now && c.expiresAt > now).reduce((total, c) => total + c.remainingMs, 0) / MINUTE; }
export function formatMinutes(minutes: number) { return (Math.floor(minutes * 10) / 10).toLocaleString('en-HK', { maximumFractionDigits: 1 }); }
export function rewardDate(at: number) { return new Date(at).toLocaleDateString('en-HK', { timeZone: REWARD_CONFIG.timeZone, day: 'numeric', month: 'short', year: 'numeric' }); }

// Credits cover elapsed time only while valid. They are settled once, at return.
// The demo allows one active rental, so no other session can spend its credits.
export function rentalBill(rental: Rental, credits: RewardCredit[], end: number, config = REWARD_CONFIG) {
  const duration = Math.max(0, end - rental.startedAt);
  const freeMs = Math.min(duration, config.normalFreeMinutes * MINUTE);
  let cursor = rental.startedAt + freeMs;
  const deductions: Record<string, number> = {};
  for (const credit of [...credits].sort((a, b) => a.expiresAt - b.expiresAt || a.id.localeCompare(b.id))) {
    if (credit.earnedAt > rental.startedAt || credit.rentalId === rental.id || credit.remainingMs <= 0) continue;
    const used = Math.max(0, Math.min(credit.remainingMs, Math.min(end, credit.expiresAt) - cursor));
    if (used) { deductions[credit.id] = used; cursor += used; }
  }
  const usedMs = cursor - rental.startedAt - freeMs;
  return { amount: priceForDuration(duration - freeMs - usedMs), usedMs, deductions };
}

// Local simulator boundary only: production must run this transition in a server
// transaction against authenticated hardware events and locked inventory/credit rows.
export function completeDemoReturn<T extends RewardState>(state: T, rentalId: string, stationId: string, at: number, config = REWARD_CONFIG): { state: T; receipt: Rental } {
  const prior = state.history.find(r => r.id === rentalId);
  if (prior) {
    if (prior.status !== 'owned' && prior.returnStationId !== stationId) throw new Error('This rental has already been returned elsewhere.');
    return { state, receipt: prior };
  }
  const rental = state.rental;
  if (!rental || rental.id !== rentalId) throw new Error('There is no matching active rental.');
  if (!Number.isFinite(at) || at < rental.startedAt) throw new Error('Invalid return time.');
  const settled = settleDemoOwnership(state, at, config);
  if (settled !== state) return { state: settled, receipt: settled.history[0] };
  const station = state.stations.find(s => s.id === stationId);
  if (!station || !canUseStation(station, 'return')) throw new Error('This station cannot accept returns. Please choose another station on the map.');
  const earnedMinutes = rewardEstimate(station, rental, state.credits, at, config);
  const bill = rentalBill(rental, state.credits, at, config);
  const expiresAt = at + config.expiryDays * 86_400_000;
  const receipt: Rental = { ...rental, returnedAt: at, returnStationId: station.id, returnStationName: station.name, amount: bill.amount, depositPaid: DEPOSIT, refundAmount: DEPOSIT - bill.amount, status: 'returned', rewardMinutesEarned: earnedMinutes, rewardMsUsed: bill.usedMs, rewardExpiresAt: earnedMinutes ? expiresAt : undefined };
  const credits = state.credits.map(c => ({ ...c, remainingMs: c.remainingMs - (bill.deductions[c.id] || 0) }));
  if (earnedMinutes) credits.push({ id: `reward-${rental.id}`, rentalId: rental.id, umbrellaId: rental.umbrellaId, stationId: station.id, stationName: station.name, earnedAt: at, expiresAt, earnedMinutes, remainingMs: earnedMinutes * MINUTE });
  const events: RewardEvent[] = [{ id: `return-${rental.id}`, kind: 'return_completed', at, stationId, rentalId }];
  if (earnedMinutes) events.push({ id: `earn-${rental.id}`, kind: 'minutes_earned', at, stationId, rentalId, minutes: earnedMinutes });
  if (bill.usedMs) events.push({ id: `use-${rental.id}`, kind: 'minutes_redeemed', at, stationId, rentalId, minutes: bill.usedMs / MINUTE });
  const stockoutSince = { ...state.stockoutSince };
  if (station.available === 0 && stockoutSince[stationId] !== undefined) {
    events.push({ id: `stockout-${rental.id}`, kind: 'stockout_ended', at, stationId, durationMs: at - stockoutSince[stationId] });
    delete stockoutSince[stationId];
  }
  return { state: { ...state, rental: null, history: [receipt, ...state.history], credits, stockoutSince, rewardEvents: [...state.rewardEvents, ...events], stations: state.stations.map(s => s.id === stationId ? { ...s, available: s.available + 1 } : s) }, receipt };
}

export function freeRentalEndsAt(rental: Rental, credits: RewardCredit[], config = REWARD_CONFIG) {
  const baseEnd = rental.startedAt + config.normalFreeMinutes * MINUTE;
  const maximumEnd = baseEnd + credits.reduce((total, credit) => total + credit.remainingMs, 0);
  return baseEnd + rentalBill(rental, credits, maximumEnd, config).usedMs;
}

export function settleDemoOwnership<T extends RewardState>(state: T, at: number, config = REWARD_CONFIG): T {
  if (!state.rental) return state;
  const rental = state.rental;
  const ownedAt = freeRentalEndsAt(rental, state.credits, config) + (DEPOSIT / PRICE_PER_HOUR) * 3600000;
  if (at < ownedAt) return state;
  const bill = rentalBill(rental, state.credits, ownedAt, config);
  const receipt: Rental = { ...rental, status: 'owned', ownedAt, depositPaid: DEPOSIT, amount: DEPOSIT, refundAmount: 0, rewardMsUsed: bill.usedMs, rewardMinutesEarned: 0 };
  const events: RewardEvent[] = [{ id: `owned-${rental.id}`, kind: 'ownership_transferred', at: ownedAt, stationId: rental.stationId, rentalId: rental.id }];
  if (bill.usedMs) events.push({ id: `use-${rental.id}`, kind: 'minutes_redeemed', at: ownedAt, stationId: rental.stationId, rentalId: rental.id, minutes: bill.usedMs / MINUTE });
  return { ...state, rental: null, history: [receipt, ...state.history], credits: state.credits.map(c => ({ ...c, remainingMs: c.remainingMs - (bill.deductions[c.id] || 0) })), rewardEvents: [...state.rewardEvents, ...events] };
}
