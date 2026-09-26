import assert from 'node:assert/strict';
import { test } from 'node:test';
import { priceForDuration, distanceMeters, isOpen, canUseStation, stationCount, parseStationCode, elapsedLabel } from '../src/lib/rental';
import { DEMO_STATIONS } from '../src/data/stations';

test('hourly price rounds started hours and caps each 24-hour period', () => {
  assert.equal(priceForDuration(0), 0);
  assert.equal(priceForDuration(-1), 0);
  assert.equal(priceForDuration(1), 5);
  assert.equal(priceForDuration(3600000), 5);
  assert.equal(priceForDuration(3600001), 10);
  assert.equal(priceForDuration(8 * 3600000), 30);
  assert.equal(priceForDuration(24 * 3600000), 30);
  assert.equal(priceForDuration(24 * 3600000 + 1), 35);
  assert.equal(priceForDuration(48 * 3600000), 60);
});
test('station hours use Hong Kong time and handle closing after midnight', () => {
  assert.equal(isOpen(DEMO_STATIONS[0], new Date('2026-09-26T04:00:00Z')), true);
  assert.equal(isOpen(DEMO_STATIONS[0], new Date('2026-09-26T16:00:00Z')), false);
  assert.equal(isOpen(DEMO_STATIONS[1], new Date('2026-09-26T16:15:00Z')), true);
  assert.equal(isOpen(DEMO_STATIONS[1], new Date('2026-09-26T16:30:00Z')), false);
  assert.equal(isOpen(DEMO_STATIONS[5], new Date('2026-09-26T19:00:00Z')), true);
});
test('borrow and return eligibility reflect inventory, capacity, and online status', () => {
  const midday = new Date('2026-09-26T04:00:00Z');
  const station = DEMO_STATIONS[0];
  assert.equal(stationCount(station, 'return'), 4);
  assert.equal(canUseStation(station, 'borrow', midday), true);
  assert.equal(canUseStation({ ...station, available: 0 }, 'borrow', midday), false);
  assert.equal(canUseStation({ ...station, available: 0 }, 'return', midday), true);
  assert.equal(canUseStation({ ...station, available: station.capacity }, 'return', midday), false);
  assert.equal(canUseStation({ ...station, status: 'offline' }, 'borrow', midday), false);
  assert.equal(canUseStation({ ...station, status: 'offline' }, 'return', midday), false);
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
