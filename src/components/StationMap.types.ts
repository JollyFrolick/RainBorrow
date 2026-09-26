import type { Coordinate, Station } from '../data/stations';
import type { Mode } from '../lib/rental';
export type StationMapProps = { stations: Station[]; selectedId: string | null; onSelect: (id: string) => void; location: Coordinate | null; mode: Mode; centerRequest: number; onLocate: () => void; locating: boolean };
