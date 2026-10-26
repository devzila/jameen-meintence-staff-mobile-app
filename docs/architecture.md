# Architecture

## Stack

| Concern      | Choice                                                                                    |
| ------------ | ----------------------------------------------------------------------------------------- |
| Runtime      | Expo SDK 57 (managed, continuous native generation), React Native 0.86, React 19.2        |
| Navigation   | Expo Router with typed routes                                                             |
| Server state | TanStack Query (lists, detail, counts, mutations)                                         |
| Client state | Zustand (session, company, locale, UI), persisted with AsyncStorage                       |
| Secrets      | Expo SecureStore                                                                          |
| i18n         | i18next + react-i18next; `en, hi, bn, mr, pa, te, kn, ta, ml` with Noto Sans script fonts |
| Styling      | `StyleSheet` with tokens from `src/constants/theme.ts` (brand orange `#E2711D`)           |
| Monitoring   | Sentry, enabled when `EXPO_PUBLIC_SENTRY_DSN` is set                                      |

`ios/` and `android/` are not committed; `npx expo prebuild` or `expo run:*` generates them.

## Routing

```
src/app/
  _layout.tsx        fonts, Sentry, SafeArea, QueryProvider, network + locale sync
  index.tsx          splash, then redirect via pickNextRoute()
  (auth)/            company, login, forgot-password, reset-password
  (staff)/_layout    auth gate, profile hydrate, push registration, notification taps
    (tabs)/          home, requests, profile  (FloatingTabBar)
    requests/[id]    request detail
    profile/         edit, change-password, language, sessions
```

`pickNextRoute()` returns `/home` with a session, `/login` with a saved company, otherwise `/company`. `SafeRedirect` replaces `<Redirect>` to avoid loops while stores hydrate.

## Multi-tenancy

Every portal request sends the `company-slug` header from `useOrg`. Changing company clears the session.

## Data flow

```
screen → features/*/hooks (TanStack Query) → services/api/* → apiFetch (client.ts)
                                                              ├─ proactive JWT refresh
                                                              ├─ 401 → single-flight refresh → retry
                                                              └─ network failure → useUi.online = false
```

Status actions update the detail cache with the returned request and invalidate the list, the home counts, and the timeline. `NetworkBootstrap` feeds `expo-network` into both `useUi.online` (top-bar badge) and TanStack's `onlineManager`, so queries pause offline and refetch on reconnect. `QueryProvider` also refetches stale queries when the app returns to the foreground, and skips retries on 4xx errors.

## Push notifications

`services/notifications.ts` lazy-loads `expo-notifications` (unavailable in Expo Go on Android), requests permission, and posts the Expo token to `POST /notifications/subscriptions` with `p256dh_key`/`auth_key` set to `expo`. Taps (including cold start) map `data.url` or `entity_type: Maintenance::Request` + `entity_id` to `/requests/:id` and ack the notification. Sign out deactivates the subscription.

## Sibling apps

Configs, the API client, auth store, i18n setup, fonts, and UI primitives are ported from `security-staff-mobile-app`. Shared code is copied rather than imported; keep fixes in sync across the three apps by hand.
