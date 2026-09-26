# RainBorrow

A mobile-first Expo / React Native frontend for shared umbrellas, with a responsive browser preview. Built from the RainBorrow architecture document.

## Run

```sh
npm install
npm run web
```

For a phone, run `npm start` and open the project with a compatible Expo Go version. `npm run ios` and `npm run android` target installed simulators/emulators. Production Android builds require your own Google Maps API key and app restrictions, Set `GOOGLE_MAPS_ANDROID_API_KEY` in a local `.env` file; `app.config.ts` passes it to the map config plugin. Native device behavior still needs device testing.

## Navigation

The app opens directly to a full-screen station map. There is no landing page. The bottom bar stays visible on desktop and mobile, including during rental checkout and return dialogs:

- **Map** returns to the station map.
- **Weather news** opens the Hong Kong Observatory in a separate browser tab on web, or the browser on native.
- **Scan to rent** sits in the center and opens the station scanner/code entry.
- **Weather mode** opens a “Coming soon” placeholder; no weather behavior is implemented.
- **Profile** includes profile details, rental history/receipts, payment preview, help, and local support notes.

## Try the full journey

1. Search for a demo station, open **Stations**, or select a map marker. Switch between Borrow and Return to see umbrella and slot availability.
2. Tap the centered **Scan to rent** button, or choose **Rent here** on a station card.
3. Enter the station code or use **Try demo station**. Review the price, enter an optional name, and choose **Simulate unlock**. Native phones also have an optional QR camera scanner.
4. **My rentals**, also accessible from **Profile**, shows the elapsed timer and estimated demo charge. Refreshing preserves the rental on this device.
5. Choose **Find a return station**, select an open station with a free slot, and choose **Return here**.
6. Confirm the simulated lock to finish. View the receipt in rental history.

Map controls provide zoom, station bounds, and your real location after explicit permission. Without location permission, browsing starts around Central, Hong Kong. Distances without permission are clearly labelled as distances from the demo centre, not your position. Directions open Google Maps externally.

## What is simulated

All stations are fictional umbrella rental points at real Hong Kong landmarks. Inventory, accounts, payments, hardware events, support requests, and receipts are local demo data. No money is collected and no physical umbrella is released. The example price is HK$5 per started hour with a HK$30 cap per 24 hours. A real deployment must enforce pricing, allocation, and rental transitions on the backend.

Names, saved stations, rentals, and support notes persist using AsyncStorage on the current device. Location is not persisted. Support notes are not sent to anyone. No API secrets or credentials are included.

## Structure

- `src/app/`: Expo Router screens (Map, Scan to rent, Profile, My rentals, How it works, Weather mode placeholder).
- `src/components/`: UI, persistent bottom navigation, secondary-screen shell, rental dialogs, native and browser map adapters.
- `src/context/AppContext.tsx`: local demo data and rental transitions; replace this boundary with backend API calls.
- `src/data/stations.ts`: clearly identified fictional inventory.
- `src/lib/rental.ts`: pricing, distances, station opening hours, eligibility, and QR parsing.
- `src/theme.ts`: colors and typography.

The browser map uses Leaflet with OpenStreetMap tiles and visible provider attribution. The public OSM tile service is for modest demo use; select a suitable production map provider before launch. Native maps use `react-native-maps` (Apple Maps on iOS and Google Maps on Android). Fonts are bundled with the app.

## Validation

```sh
npm run typecheck
npm run lint
npm test
npm run build:web
```

Before real rentals: connect authentication, authoritative station inventory, idempotent rental APIs, a payment provider, verified device events, and support delivery. Never treat a client-side QR scan or checkbox as physical return evidence.
