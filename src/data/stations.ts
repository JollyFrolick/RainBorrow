export type Coordinate = { latitude: number; longitude: number };
export type Station = Coordinate & {
  id: string; name: string; district: string; address: string; landmark: string;
  available: number; capacity: number; status: 'online' | 'offline'; hours: string;
  category: 'MTR' | 'Café' | 'Shopping' | 'Waterfront';
};
export const DEMO_CENTER: Coordinate = { latitude: 22.2821, longitude: 114.1586 };
// Fictional rental stations at real Hong Kong landmarks. Never advertise these as live inventory.
export const DEMO_STATIONS: Station[] = [
  { id: 'RB-001', name: 'Central Market', district: 'Central', address: '93 Queen’s Road Central', landmark: 'Ground floor · Queen’s Road entrance', latitude: 22.2843, longitude: 114.1559, available: 8, capacity: 12, status: 'online', hours: '07:00–23:00', category: 'Shopping' },
  { id: 'RB-002', name: 'Central MTR', district: 'Central', address: 'Des Voeux Road Central', landmark: 'Street level · Exit D2', latitude: 22.2817, longitude: 114.1584, available: 5, capacity: 10, status: 'online', hours: '06:00–00:30', category: 'MTR' },
  { id: 'RB-003', name: 'PMQ', district: 'Sheung Wan', address: '35 Aberdeen Street', landmark: 'Courtyard · Main entrance', latitude: 22.2836, longitude: 114.1518, available: 3, capacity: 8, status: 'online', hours: '09:00–22:00', category: 'Shopping' },
  { id: 'RB-004', name: 'IFC Mall', district: 'Central', address: '8 Finance Street', landmark: 'Level 1 · Harbour-facing entrance', latitude: 22.2857, longitude: 114.1582, available: 10, capacity: 10, status: 'online', hours: '10:00–22:00', category: 'Shopping' },
  { id: 'RB-005', name: 'Sheung Wan MTR', district: 'Sheung Wan', address: 'Des Voeux Road West', landmark: 'Street level · Exit A2', latitude: 22.2865, longitude: 114.1515, available: 0, capacity: 12, status: 'online', hours: '06:00–00:30', category: 'MTR' },
  { id: 'RB-006', name: 'Central Pier', district: 'Central', address: 'Man Kwong Street', landmark: 'Pier 7 · Covered walkway', latitude: 22.2875, longitude: 114.1612, available: 6, capacity: 12, status: 'online', hours: '24 hours', category: 'Waterfront' },
  { id: 'RB-007', name: 'Tai Kwun', district: 'Central', address: '10 Hollywood Road', landmark: 'Parade ground entrance', latitude: 22.2808, longitude: 114.1543, available: 4, capacity: 8, status: 'offline', hours: '08:00–23:00', category: 'Café' },
];
