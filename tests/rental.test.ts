import assert from 'node:assert/strict';
import { test } from 'node:test';
import { priceForDuration, distanceMeters, canUseStation, stationCount, parseStationCode, elapsedLabel, assertRentalCooldownEnded, rentalCooldownEndsAt, RENTAL_COOLDOWN_MS, type Rental } from '../src/lib/rental';
import { DEMO_STATIONS } from '../src/data/stations';

const cooldownRental: Rental = { id: 'r1', umbrellaId: 'u1', stationId: 'RB-001', stationName: 'Test station', startedAt: 1000 };
test('first rentals have no cooldown', () => {
  assert.equal(rentalCooldownEndsAt([]), 0);
  assert.doesNotThrow(() => assertRentalCooldownEnded([], 1000));
  assert.equal(rentalCooldownEndsAt([cooldownRental]), 0);
});
test('returns and ownership block new rentals until exactly one hour after ending', () => {
  const endedAt = 10000;
  for (const rental of [
    { ...cooldownRental, status: 'returned' as const, returnedAt: endedAt },
    { ...cooldownRental, status: 'owned' as const, ownedAt: endedAt },
  ]) {
    const history = [rental];
    assert.throws(() => assertRentalCooldownEnded(history, endedAt), /60 min/);
    assert.throws(() => assertRentalCooldownEnded(history, endedAt + RENTAL_COOLDOWN_MS - 1), /1 min/);
    assert.doesNotThrow(() => assertRentalCooldownEnded(history, endedAt + RENTAL_COOLDOWN_MS));
    assert.doesNotThrow(() => assertRentalCooldownEnded(history, endedAt + RENTAL_COOLDOWN_MS + 1));
  }
});
test('cooldown survives saved-history reloads and uses the latest end time', () => {
  const history: Rental[] = JSON.parse(JSON.stringify([
    { ...cooldownRental, returnedAt: 2000 },
    { ...cooldownRental, id: 'r2', ownedAt: 5000 },
  ]));
  assert.equal(rentalCooldownEndsAt(history), 5000 + RENTAL_COOLDOWN_MS);
  assert.throws(() => assertRentalCooldownEnded(history, 5000 + RENTAL_COOLDOWN_MS - 1));
});
test('demo bypass clears only the current cooldown and preserves rental history', () => {
  for (const ended of [{ returnedAt: 5000 }, { ownedAt: 5000 }]) {
    const history = [{ ...cooldownRental, id: 'latest', ...ended }, { ...cooldownRental, returnedAt: 2000 }];
    const saved = JSON.stringify(history);
    assert.equal(rentalCooldownEndsAt(history, 'latest'), 0);
    assert.doesNotThrow(() => assertRentalCooldownEnded(history, 5001, 'latest'));
    assert.throws(() => assertRentalCooldownEnded(history, 5001, 'unknown'));
    assert.equal(JSON.stringify(history), saved);
    const reloaded = JSON.parse(JSON.stringify({ history, bypass: 'latest' }));
    assert.doesNotThrow(() => assertRentalCooldownEnded(reloaded.history, 5001, reloaded.bypass));
    const nextHistory = [{ ...cooldownRental, id: 'next', returnedAt: 6000 }, ...history];
    assert.throws(() => assertRentalCooldownEnded(nextHistory, 6001, 'latest'));
  }
});

test('deductions use completed hours and never exceed the HK$60 deposit', () => {
  assert.equal(priceForDuration(0), 0);
  assert.equal(priceForDuration(-1), 0);
  assert.equal(priceForDuration(1), 0);
  assert.equal(priceForDuration(3600000), 5);
  assert.equal(priceForDuration(3600001), 5);
  assert.equal(priceForDuration(8 * 3600000), 40);
  assert.equal(priceForDuration(24 * 3600000), 60);
  assert.equal(priceForDuration(24 * 3600000 + 1), 60);
  assert.equal(priceForDuration(48 * 3600000), 60);
});
test('legacy station closing times do not restrict 24/7 borrowing or returns', () => {
  const station = { ...DEMO_STATIONS[0], hours: '00:00–00:01' };
  assert.equal(canUseStation(station, 'borrow'), true);
  assert.equal(canUseStation(station, 'return'), true);
  assert.equal(canUseStation({ ...station, status: 'offline' }, 'return'), false);
});
test('borrow and return eligibility reflect inventory, capacity, and online status', () => {
  const station = DEMO_STATIONS[0];
  assert.equal(stationCount(station, 'return'), 4);
  assert.equal(canUseStation(station, 'borrow'), true);
  assert.equal(canUseStation({ ...station, available: 0 }, 'borrow'), false);
  assert.equal(canUseStation({ ...station, available: 0 }, 'return'), true);
  assert.equal(canUseStation({ ...station, available: station.capacity }, 'return'), false);
  assert.equal(canUseStation({ ...station, status: 'offline' }, 'borrow'), false);
  assert.equal(canUseStation({ ...station, status: 'offline' }, 'return'), false);
});
test('QR parsing accepts station codes and station URLs but rejects unrelated text', () => {
  assert.equal(parseStationCode('RB-001'), 'RB-001');
  assert.equal(parseStationCode('  rb-002 '), 'RB-002');
  assert.equal(parseStationCode('001'), 'RB-001');
  assert.equal(parseStationCode('https://rainborrow.example/station/RB-003'), 'RB-003');
  assert.equal(parseStationCode('invalid'), null);
  assert.equal(parseStationCode('RB-0001'), null);
});
test('distances and timer handle expected boundaries', () => {
  assert.equal(distanceMeters(DEMO_STATIONS[0], DEMO_STATIONS[0]), 0);
  assert.ok(distanceMeters(DEMO_STATIONS[0], DEMO_STATIONS[1]) > 100);
  assert.equal(elapsedLabel(-100), '00:00:00');
  assert.equal(elapsedLabel(3661000), '01:01:01');
});
