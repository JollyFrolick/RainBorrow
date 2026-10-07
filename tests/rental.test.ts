import assert from 'node:assert/strict';
import { test } from 'node:test';
import { priceForDuration, distanceMeters, canUseStation, stationCount, parseStationCode, elapsedLabel } from '../src/lib/rental';
import { DEMO_STATIONS } from '../src/data/stations';

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
