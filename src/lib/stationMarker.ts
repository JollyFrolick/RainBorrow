import type { Mode } from './rental';
import { REWARD_CONFIG } from './rewards';

export function stationSymbol(mode: Mode) { return mode === 'return' ? '⭕' : '🟢'; }
export function rewardMarker(minutes: number) {
  if (minutes >= REWARD_CONFIG.criticalMinutes) return { color: '#F4A3A3', label: 'Highest reward' };
  if (minutes > 0) return { color: '#FFE28A', label: 'Extra time reward' };
  return { color: '#FFFFFF', label: 'No extra reward' };
}
