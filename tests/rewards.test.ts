import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DEMO_STATIONS, type Station } from '../src/data/stations';
import { completeDemoReturn as completeReturn, dailyRemaining, MINUTE, rentalBill as billWithDefaults, freeRentalEndsAt, REWARD_CONFIG, rewardBalance, rewardEstimate, type RewardCredit, type RewardState } from '../src/lib/rewards';
import type { Rental } from '../src/lib/rental';

// Exercise credit settlement independently with a zero base allowance.
const creditOnlyConfig = { ...REWARD_CONFIG, normalFreeMinutes: 0 };
const rentalBill: typeof billWithDefaults = (rental, credits, end, config = creditOnlyConfig) => billWithDefaults(rental, credits, end, config);
const completeDemoReturn: typeof completeReturn = (state, rentalId, stationId, at, config = creditOnlyConfig) => completeReturn(state, rentalId, stationId, at, config);

const now = Date.parse('2026-10-08T04:00:00Z');
const station: Station = { ...DEMO_STATIONS[0], id: 'destination', capacity: 10, available: 2 };
const rental: Rental = { id: 'rental-1', umbrellaId: 'u-1', stationId: 'origin', stationName: 'Origin', startedAt: now - 45 * MINUTE };
function credit(overrides: Partial<RewardCredit> = {}): RewardCredit { return { id: 'credit-1', rentalId: 'previous', umbrellaId: 'u-0', stationId: station.id, stationName: station.name, earnedAt: now - 86_400_000, expiresAt: now + 86_400_000, earnedMinutes: 30, remainingMs: 30 * MINUTE, ...overrides }; }
function state(overrides: Partial<RewardState> = {}): RewardState { return { stations: [station], rental, history: [], credits: [], rewardEvents: [], stockoutSince: {}, ...overrides }; }

test('reward boundaries include empty, 20%, 40%, and healthy stations', () => {
  for (const [available, expected] of [[0, 30], [2, 30], [3, 15], [4, 15], [5, 0], [10, 0]]) assert.equal(rewardEstimate({ ...station, available }, rental, [], now), expected);
});
test('ineligible stations and same-origin returns earn nothing', () => {
  for (const change of [{ status: 'offline' as const }, { capacity: 0 }, { available: 10 }, { id: rental.stationId }]) assert.equal(rewardEstimate({ ...station, ...change }, rental, [], now), 0);
  assert.equal(rewardEstimate(station, null, [], now), 0);
});
test('daily cap counts earned credits even after spending, with Hong Kong day rollover', () => {
  const credits = [credit({ earnedAt: now, earnedMinutes: 55, remainingMs: 0 })];
  assert.equal(rewardEstimate(station, rental, credits, now), 5);
  assert.equal(dailyRemaining(credits, Date.parse('2026-10-08T15:59:59Z')), 5);
  assert.equal(dailyRemaining(credits, Date.parse('2026-10-08T16:00:00Z')), 60);
  assert.equal(rewardEstimate(station, rental, [credit({ earnedAt: now, earnedMinutes: 60 })], now), 0);
});
test('return uses latest pre-return inventory and never spends its own reward', () => {
  const result = completeDemoReturn(state(), rental.id, station.id, now);
  assert.equal(result.receipt.rewardMinutesEarned, 30);
  assert.equal(result.receipt.amount, 5);
  assert.equal(result.receipt.rewardMsUsed, 0);
  assert.equal(result.state.stations[0].available, 3);
  assert.equal(result.state.credits[0].expiresAt, now + 30 * 86_400_000);
  assert.equal(completeDemoReturn(state({ stations: [{ ...station, available: 4 }] }), rental.id, station.id, now).receipt.rewardMinutesEarned, 15);
});
test('repeated and delayed duplicate confirmations reuse receipt without changing state', () => {
  const first = completeDemoReturn(state(), rental.id, station.id, now);
  const duplicate = completeDemoReturn(first.state, rental.id, station.id, now + 86_400_000);
  assert.equal(duplicate.state, first.state);
  assert.equal(duplicate.receipt, first.receipt);
  assert.throws(() => completeDemoReturn(first.state, rental.id, 'elsewhere', now));
});
test('serialized returns observe preceding inventory and daily earnings', () => {
  const first = completeDemoReturn(state(), rental.id, station.id, now);
  const secondRental = { ...rental, id: 'rental-2', startedAt: now };
  const second = completeDemoReturn({ ...first.state, rental: secondRental }, secondRental.id, station.id, now + MINUTE);
  assert.equal(second.receipt.rewardMinutesEarned, 15);
  assert.equal(second.state.stations[0].available, 4);
  const thirdRental = { ...secondRental, id: 'rental-3' };
  const third = completeDemoReturn({ ...second.state, rental: thirdRental }, thirdRental.id, station.id, now + 2 * MINUTE);
  assert.equal(third.receipt.rewardMinutesEarned, 15);
  assert.equal(dailyRemaining(third.state.credits, now), 0);
});
test('free allowance precedes credits and billing preserves started-hour rounding', () => {
  const bill = rentalBill(rental, [credit()], now, { ...REWARD_CONFIG, normalFreeMinutes: 10 });
  assert.equal(bill.usedMs, 30 * MINUTE);
  assert.equal(bill.amount, 5);
  assert.equal(rentalBill({ ...rental, startedAt: now - 30 * MINUTE }, [credit()], now).amount, 0);
  assert.equal(rentalBill({ ...rental, startedAt: now - 30 * MINUTE - 1 }, [credit()], now).amount, 5);
  assert.equal(rentalBill({ ...rental, startedAt: now - 90 * MINUTE - 1 }, [credit()], now).amount, 10);
});
test('earliest expiry first, exact elapsed usage, and unused credits survive', () => {
  const credits = [credit({ id: 'later', expiresAt: now + 99999 }), credit({ id: 'earlier', expiresAt: now + 9999, remainingMs: 20 * MINUTE })];
  const result = completeDemoReturn(state({ credits }), rental.id, station.id, now);
  assert.equal(result.state.credits.find(c => c.id === 'earlier')?.remainingMs, 0);
  assert.equal(result.state.credits.find(c => c.id === 'later')?.remainingMs, 5 * MINUTE);
  assert.equal(result.receipt.amount, 0);
  const short = rentalBill({ ...rental, startedAt: now - 1000 }, [credit()], now);
  assert.equal(short.usedMs, 1000);
});
test('expired credits cannot cover time after expiry; credits earned after start are excluded', () => {
  assert.equal(rewardBalance([credit({ expiresAt: now })], now), 0);
  assert.equal(rentalBill(rental, [credit({ expiresAt: rental.startedAt })], now).usedMs, 0);
  assert.equal(rentalBill(rental, [credit({ expiresAt: rental.startedAt + 10 * MINUTE })], now).usedMs, 10 * MINUTE);
  assert.equal(rentalBill(rental, [credit({ earnedAt: rental.startedAt + 1 })], now).usedMs, 0);
});
test('settled credits cannot be spent again by another rental or duplicate return', () => {
  const first = completeDemoReturn(state({ credits: [credit()], stations: [{ ...station, available: 5 }] }), rental.id, station.id, now);
  const nextRental = { ...rental, id: 'next', startedAt: now };
  const second = completeDemoReturn({ ...first.state, rental: nextRental }, nextRental.id, station.id, now + 30 * MINUTE);
  assert.equal(first.receipt.rewardMsUsed, 30 * MINUTE);
  assert.equal(second.receipt.rewardMsUsed, 0);
  assert.equal(second.receipt.amount, 5);
});
test('invalid transitions leave input unchanged and tracked stockouts close on return', () => {
  const initial = state();
  assert.throws(() => completeDemoReturn(initial, rental.id, station.id, rental.startedAt - 1));
  assert.throws(() => completeDemoReturn(initial, 'wrong-rental', station.id, now));
  assert.throws(() => completeDemoReturn(state({ stations: [{ ...station, status: 'offline' }] }), rental.id, station.id, now));
  assert.equal(initial.stations[0].available, 2);
  const result = completeDemoReturn(state({ stations: [{ ...station, available: 0 }], stockoutSince: { [station.id]: now - 1234 } }), rental.id, station.id, now);
  assert.equal(result.state.rewardEvents.find(e => e.kind === 'stockout_ended')?.durationMs, 1234);
  assert.equal(result.state.stockoutSince[station.id], undefined);
});

test('24/7 stations earn rewards overnight even with legacy stored hours', () => {
  const overnight = Date.parse('2026-10-08T19:00:00Z');
  const legacyStation = { ...station, hours: '09:00–22:00' };
  assert.equal(rewardEstimate(legacyStation, rental, [], overnight), 30);
  assert.equal(completeDemoReturn(state({ stations: [legacyStation] }), rental.id, station.id, overnight).receipt.rewardMinutesEarned, 30);
});

test('default pricing gives 24 free hours before started-hour charges', () => {
  const start = rental.startedAt;
  assert.equal(billWithDefaults(rental, [], start + 24 * 60 * MINUTE).amount, 0);
  assert.equal(billWithDefaults(rental, [], start + 24 * 60 * MINUTE + 1).amount, 5);
  assert.equal(billWithDefaults(rental, [], start + 25 * 60 * MINUTE + 1).amount, 10);
  assert.equal(completeReturn(state(), rental.id, station.id, now).receipt.amount, 0);
});
test('countdown survives reload and rewards extend the initial 24 hours', () => {
  const credits = [credit({ expiresAt: now + 7 * 86400000 })];
  const freeEnd = rental.startedAt + (24 * 60 + 30) * MINUTE;
  assert.equal(freeRentalEndsAt(JSON.parse(JSON.stringify(rental)), credits), freeEnd);
  assert.equal(billWithDefaults(rental, credits, rental.startedAt + 60 * MINUTE).usedMs, 0);
  assert.equal(billWithDefaults(rental, credits, freeEnd).amount, 0);
  assert.equal(billWithDefaults(rental, credits, freeEnd + 1).amount, 5);
  assert.equal(freeRentalEndsAt(rental, [credit({ expiresAt: rental.startedAt + MINUTE })]), rental.startedAt + 24 * 60 * MINUTE);
});
