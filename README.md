# RainBorrow

A mobile-first Expo / React Native frontend for shared umbrellas, with a responsive browser preview. Built from the RainBorrow architecture document.

## Run

```sh
npm install
npm run web
```

For a phone, run `npm start` and open the project with a compatible Expo Go version. `npm run ios` and `npm run android` target installed simulators/emulators. Production Android builds require your own Google Maps API key and app restrictions, Set `GOOGLE_MAPS_ANDROID_API_KEY` in a local `.env` file; `app.config.ts` passes it to the map config plugin. Native device behavior still needs device testing.

## Navigation

The app opens directly to a full-screen station map. There is no landing page. The bottom navigation uses floating icons with individual white circles around the two outer buttons, without a background bar or visible labels. Accessible labels identify each action. It stays visible on desktop and mobile, including during rental checkout and return dialogs:

- **Map** returns to the station map.
- **Scan to rent** sits in the center and opens the station scanner/code entry. Selecting a map station changes its action to **View rental** while retaining the original scan icon, opening that station’s borrowing review; with an active rental, it opens My rentals. Unavailable stations cannot start a new rental. Closing station details restores the scan action when no rental is active.
- **Profile** includes profile details, rental history/receipts, payment preview, help, and local support notes.

## Try the full journey

1. Pan and zoom the map, then tap a station marker to see its details. The map shows umbrellas before borrowing and return slots automatically during an active rental.
2. Tap the centered **Scan to rent** button, or choose **Rent here** on a station card.
3. Enter the station code or use **Try demo station**. Review the price, enter an optional name, and choose **Simulate HK$60 deposit & unlock**. Native phones also have an optional QR camera scanner.
4. **My rentals**, also accessible from **Profile**, shows the elapsed timer and estimated demo charge. Refreshing preserves the rental on this device.
5. Choose **Find a return station**, select an open station with a free slot, and choose **Return here**.
6. Confirm the simulated lock to finish. View the receipt in rental history.

Map controls provide zoom, station bounds, and your real location after explicit permission. Without location permission, browsing starts around Central, Hong Kong. Distances without permission are clearly labelled as distances from the demo centre, not your position. Directions open Google Maps externally.

## What is simulated

All stations operate 24/7 and are fictional umbrella rental points at real Hong Kong landmarks. Borrowing and returns depend on inventory, free slots, and online status, with no closing-time restrictions. Legacy saved opening hours are ignored. Inventory, accounts, payments, hardware events, support requests, and receipts are local demo data. No money is collected and no physical umbrella is released. The first 12 rental hours are free, followed by any valid reward time. Each rental starts with a simulated HK$60 deposit. After free time, HK$5 is deducted per completed hour, capped at the HK$60 deposit. Returning earlier refunds the unused balance. After 12 paid hours (24 hours total without reward extensions), ownership transfers to the customer and deductions stop. A real deployment must enforce pricing, allocation, and rental transitions on the backend.

Names, saved stations, rentals, and support notes persist using AsyncStorage on the current device. Location is not persisted. Support notes are not sent to anyone. No API secrets or credentials are included.

## Structure

- `src/app/`: Expo Router screens (Map, Scan to rent, Profile, My rentals, How it works).
- `src/components/`: UI, persistent bottom navigation, secondary-screen shell, rental dialogs, native and browser map adapters.
- `src/context/AppContext.tsx`: local demo data and rental transitions; replace this boundary with backend API calls.
- `src/data/stations.ts`: clearly identified fictional inventory.
- `src/lib/rental.ts`: pricing, distances, 24/7 station eligibility, and QR parsing.
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

## Dynamic Return Rewards (local demo)

Map markers use 🟢 with available umbrella counts before borrowing and ⭕ with free return-slot counts during a rental. Return markers use red for the highest reward, yellow for a smaller reward, and white for no reward, with a visible legend and accessible text. Exact reward estimates remain in station details; markers show no reward numbers. A return to a different station earns 30 minutes at 0–20% supply or 15 minutes above 20–40%, capped at 60 minutes per Hong Kong calendar day. No reward offers are locked or reserved. Availability is recalculated before the simulated return changes inventory. The profile contains the balance, earnings, usage, and expirations; receipts show actual earned and redeemed time.

Settings live in `src/lib/rewards.ts` (`REWARD_CONFIG`). Operational capacity and usable inventory are represented by `capacity` and `available`; all empty slots in the demo are assumed operational. The normal free allowance is 12 hours. The active-rental banner counts down the free period each second using the persisted rental start time, including eligible reward extensions. Successful simulated unlock returns to the map and displays this banner. Credits expire exactly 30 days after earning. Exact elapsed milliseconds are consumed earliest-expiry-first, only for time before each credit expires; completed-hour deductions apply to the remaining duration, with a lifetime maximum of HK$60 for that rental. Credits earned by a return cannot pay for that rental. Only one rental can be active in the local profile. Active-rental usage is projected until return or ownership transfer. A return settles deductions and the simulated refund together with inventory and rewards. Ownership settles consumed credits and moves the rental into history without increasing station inventory or issuing a return reward. The app checks ownership every second while running, upon loading saved data, and before rental transitions. Production needs a server scheduler and payment-provider deposit/refund transactions; client timers never collect real money. Existing completed receipts remain unchanged; active demo rentals use the current deposit policy.

Existing local profiles migrate to an empty reward ledger without losing rentals. Reward state and local measurement events persist under the existing demo storage key. Estimate events are deduplicated by rental, station, and displayed amount. Return, earned-minute, redeemed-minute, and observed stockout-duration events are stored in `rewardEvents`. Stockout measurement starts when first observed on this device, not before. These events are local diagnostics, not a connected analytics service.

### Production integration boundary

`completeDemoReturn` is explicitly a simulator, not a trusted return endpoint. Before enabling real rewards:

- Authenticate users and station hardware; derive user, umbrella, rental, destination, and event time from trusted records. A client confirmation must never create a real credit.
- Execute inventory changes, daily-cap checks, credit deductions, receipt creation, and analytics outbox writes in one database transaction. Lock station and user ledger rows, enforce one active rental per user, and add unique constraints on hardware event IDs and qualifying rental IDs. Return the original receipt on retries.
- Supply operational capacity, usable umbrellas, and functioning empty slots from hardware inventory, rather than assuming all capacity is working. Stream inventory changes to clients and refresh on resume. The demo updates immediately on local transitions and refreshes time-based estimates every 30 seconds; it has no live inventory feed.
- Serialize events by authoritative station sequence. Hold out-of-order events pending reconciliation. For delayed first-time confirmations, reconstruct pre-return inventory and the user ledger from ordered history; never pass an old timestamp against current inventory. The demo handles delayed duplicates only, not historical first-time hardware events.
- Settle credit usage server-side and use a payment-provider idempotency key. If concurrent rentals are later supported, allocate credits transactionally so the same balance cannot fund multiple sessions.
- Export deduplicated measurement events to analytics; derive stockout duration from authoritative inventory history and evaluate availability improvement against redeemed-time cost.

The demo uses device time and editable local storage and cannot enforce rewards across accounts, devices, or browser tabs. No production backend, authentication, physical return confirmation, payments, or analytics pipeline is provided by this repository.

To try rewards at any time: borrow from Central Market, return to empty Sheung Wan MTR, inspect the receipt/profile, then borrow again to see the free time applied. PMQ initially offers the 15-minute tier. Returning to the origin or a healthy station earns no reward.
