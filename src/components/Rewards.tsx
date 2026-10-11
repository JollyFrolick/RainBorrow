import React, { useEffect } from 'react';
import { View } from 'react-native';
import type { Station } from '../data/stations';
import { useApp } from '../context/AppContext';
import { dailyRemaining, formatMinutes, MINUTE, rentalBill, REWARD_CONFIG, rewardBalance, rewardDate, rewardEstimate } from '../lib/rewards';
import { colors as c, fonts as f } from '../theme';
import { Icon, Pill, s, T } from './ui';

export const REWARD_NOTICE = 'Rewards may change with station availability at return.';
export function RewardEstimate({ station, details = false }: { station: Station; details?: boolean }) {
  const app = useApp();
  const minutes = rewardEstimate(station, app.rental, app.credits, app.now);
  const track = app.trackRewardEstimate;
  useEffect(() => { if (minutes > 0) track(station.id, minutes); }, [minutes, station.id, track]);
  if (!app.rental) return null;
  return <View style={{ gap: 3 }}>
    {minutes > 0 ? <Pill>Earn {minutes} extra free minutes</Pill> : details ? <T style={{ fontSize: 12, color: c.muted }}>{app.rental.stationId === station.id ? 'Returns to your original station do not earn extra minutes.' : dailyRemaining(app.credits, app.now) === 0 ? 'You have reached today’s extra-minute earning limit.' : 'No extra minutes at this station right now.'}</T> : null}
    {details && <T style={{ fontSize: 11, color: c.muted, lineHeight: 15 }}>{REWARD_NOTICE}</T>}
  </View>;
}
export function RewardsCard() {
  const app = useApp();
  const bill = app.rental ? rentalBill(app.rental, app.credits, app.now) : null;
  const available = app.credits.map(credit => ({ ...credit, remainingMs: credit.remainingMs - (bill?.deductions[credit.id] || 0) }));
  const upcoming = available.filter(credit => credit.remainingMs > 0 && credit.expiresAt > app.now).sort((a, b) => a.expiresAt - b.expiresAt)[0];
  return <View style={[s.card, { gap: 16, marginBottom: 24 }]}>
    <View style={[s.row, { flexWrap: 'wrap' }]}><Icon name="clock" /><T style={{ fontFamily: f.bold, fontSize: 20 }}>Extra free minutes</T><Pill tone="orange">Demo</Pill></View>
    <T style={{ fontFamily: f.display, fontSize: 38 }}>{formatMinutes(rewardBalance(available, app.now))} <T style={{ fontSize: 16 }}>minutes available</T></T>
    <T style={s.muted}>Return where umbrellas are needed. Earn {REWARD_CONFIG.criticalMinutes} minutes at stations up to {REWARD_CONFIG.criticalThreshold * 100}% full, or {REWARD_CONFIG.lowMinutes} minutes at stations up to {REWARD_CONFIG.lowThreshold * 100}% full.</T>
    <T style={{ color: c.muted, fontSize: 12, lineHeight: 19 }}>Extra minutes apply automatically to future rentals, after the first 12 free hours and before paid time. Earn up to {REWARD_CONFIG.dailyMinutes} minutes per Hong Kong calendar day; {dailyRemaining(app.credits, app.now)} minutes left to earn today. Credits expire {REWARD_CONFIG.expiryDays} days after earning. Same-origin returns earn no reward.</T>
    {upcoming && <T style={{ fontSize: 12, color: c.green }}>Next expiry: {formatMinutes(upcoming.remainingMs / MINUTE)} minutes on {rewardDate(upcoming.expiresAt)}</T>}
    {!!bill?.usedMs && <T style={{ fontSize: 12, color: c.green }}>{formatMinutes(bill.usedMs / MINUTE)} minutes applied to your active rental so far; finalized on return.</T>}
    <T style={{ fontFamily: f.bold }}>Reward history</T>
    {!app.credits.length && <T style={s.muted}>Your first qualifying return will appear here.</T>}
    {[...app.credits].reverse().map(credit => <View key={credit.id} style={{ borderTopWidth: 1, borderTopColor: c.line, paddingTop: 12, gap: 5 }}>
      <T style={{ fontFamily: f.semibold }}>+{credit.earnedMinutes} minutes · {credit.stationName}</T>
      <T style={{ fontSize: 11, color: c.muted }}>Earned {rewardDate(credit.earnedAt)} · {formatMinutes(credit.earnedMinutes - credit.remainingMs / MINUTE)} minutes used</T>
      <T style={{ fontSize: 11, color: c.muted }}>{credit.remainingMs === 0 ? 'Fully used' : credit.expiresAt <= app.now ? `${formatMinutes(credit.remainingMs / MINUTE)} unused minutes expired ${rewardDate(credit.expiresAt)}` : `${formatMinutes(credit.remainingMs / MINUTE)} minutes remaining · Expires ${rewardDate(credit.expiresAt)}`}</T>
    </View>)}
    {app.history.filter(r => r.rewardMsUsed).map(r => <T key={r.id} style={{ fontSize: 11, color: c.muted }}>Used {formatMinutes((r.rewardMsUsed || 0) / MINUTE)} minutes · Rental from {r.stationName} · {rewardDate((r.returnedAt || r.ownedAt)!)}</T>)}
  </View>;
}
