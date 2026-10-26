# Jameen Maintenance Staff Mobile App

Native iOS and Android app for society maintenance staff (technicians, plumbers, electricians). Built with **React Native**, **Expo SDK 57**, and **TypeScript**. It talks to the existing Jameen API under `/v1/maintenance_staff`; it does **not** wrap the PWA in a WebView.

The sibling [`maintenance-staff-pwa`](../maintenance-staff-pwa) is the business and UX reference. The stack and conventions match [`security-staff-mobile-app`](../security-staff-mobile-app) and [`resident-mobile-app`](../resident-mobile-app): Expo Router, TanStack Query, Zustand, Expo SecureStore, i18next.

This app targets **Expo SDK 57**, React Native **0.86**, React **19.2**.

See `docs/` for architecture, auth, and API notes.

## Auth flow

Same model as the PWA and `jameen-api/docs/frontend_auth_integration.md`:

1. **Company**: enter the company slug (`GET /v1/maintenance_staff/companies/:slug`)
2. **Login**: email + password (`POST /v1/maintenance_staff/auth/session`)
3. **Forgot password**: request a reset email (`POST /v1/maintenance_staff/auth/passwords`)
4. **Reset password**: `jameen-maintenance://reset-password?token=…&company-slug=…` or `https://maintenance.jameen.com/reset-password?...` (`PUT /v1/maintenance_staff/auth/passwords/:token`)

Sessions use access + refresh tokens. The client refreshes shortly before the access token expires and once more on a `401`.

## Modules

| Module             | Screens                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Company / Auth     | `/company`, `/login`, `/forgot-password`, `/reset-password`                                       |
| Home / Dashboard   | `/home` (counts by status, SLA breaches, high-priority work)                                      |
| Requests           | `/requests` (status filters, infinite scroll), `/requests/[id]`                                   |
| Request workflow   | Acknowledge, start, hold (with reason), resume, resolve (optional actual cost)                    |
| Activity           | Comments (resident-visible), internal notes, status timeline                                      |
| Profile / Settings | `/profile`, `/profile/edit`, `/profile/change-password`, `/profile/language`, `/profile/sessions` |

Bottom navigation: **Home · Requests · Profile**

Push notifications register an Expo push token with `POST /notifications/subscriptions`. Tapping a notification opens the request it refers to.

## Architecture

Feature-oriented layout under `src/`:

- `app/`: Expo Router screens (`(auth)` group, `(staff)` group with `(tabs)`)
- `components/`: reusable UI (`ui/` primitives plus request-specific pieces)
- `features/`: TanStack Query hooks and domain helpers (`requests`, `profile`, `authentication`)
- `lib/`: pure helpers with colocated tests (`requestStatus`, `routes`, `jwt`, `fonts`, `phone`)
- `services/api/`: Jameen API client (`/v1/maintenance_staff`)
- `store/`: Zustand (company, auth session, locale, onboarding, UI)
- `i18n/`: i18next with English plus 8 Indian languages
- `types/`: API contracts

## Prerequisites

| Tool       | Version / notes                                                                   |
| ---------- | --------------------------------------------------------------------------------- |
| Node       | **22.13+** (repo `.nvmrc` is `22`)                                                |
| npm        | 10+                                                                               |
| Expo CLI   | via `npx expo` (do not install a global Expo CLI)                                 |
| Jameen API | sibling [`jameen-api`](../jameen-api) running locally, or a reachable staging URL |

iOS needs Xcode 16+ with a simulator runtime. Android needs Android Studio with SDK 36 and an emulator.

## Local setup

```bash
cd maintenance-staff-mobile-app
cp .env.example .env
npm install
```

Edit `.env`. Expo inlines `EXPO_PUBLIC_*` at Metro start, so restart the bundler after any change.

| Variable                 | Purpose                                                  |
| ------------------------ | -------------------------------------------------------- |
| `EXPO_PUBLIC_API_URL`    | Jameen API base URL, **no trailing slash**, **no `/v1`** |
| `EXPO_PUBLIC_APP_ENV`    | `development` \| `staging` \| `production`               |
| `EXPO_PUBLIC_SENTRY_DSN` | Optional. Leave empty locally                            |

### API URL by where the app runs

`localhost` on a phone is **the phone**, not your laptop.

| Where you run the app     | `EXPO_PUBLIC_API_URL`                                |
| ------------------------- | ---------------------------------------------------- |
| iOS Simulator             | `http://localhost:3000`                              |
| Android Emulator          | `http://10.0.2.2:3000`                               |
| Physical iPhone / Android | `http://YOUR_LAN_IP:3000` (`ipconfig getifaddr en0`) |
| Staging / production API  | `https://…`                                          |

For a physical device, run Rails with `bin/rails s -b 0.0.0.0 -p 3000` and allow your LAN host (`RAILS_DEVELOPMENT_HOSTS=192.168.x.x` or `config.hosts`). The security staff app README has the full LAN walkthrough.

## Run locally

```bash
npm start          # Expo Go (exp:// QR)
npm run start:dev  # development build (needs the Jameen Maintenance dev client installed)
npm run ios        # build and run on the iOS Simulator
npm run android    # build and run on an Android emulator
```

Push notifications are not available in Expo Go on Android. Use a development build to test them.

## Testing, lint, types

```bash
npm test
npm run typecheck
npm run lint
npx expo-doctor
```

## EAS setup and builds

The app does not have an EAS project yet. Once, from this directory:

```bash
npm install -g eas-cli
eas login
eas init            # writes extra.eas.projectId into app.json
eas update:configure  # adds updates.url for OTA updates
```

Push tokens need the EAS `projectId`, so run `eas init` before testing notifications on a device. Then:

```bash
eas build --profile development --platform all
eas build --profile staging --platform android
eas build --profile production --platform all
```

Set API URLs and the Sentry DSN as EAS environment variables, not in git.

## Known backend gaps (do not invent)

- **Notification inbox**: maintenance staff have no `GET /notifications` route, only subscribe, unsubscribe, and ack. The app has no inbox screen; notification taps open the request directly.
- **Photo / file uploads from staff**: `Maintenance::TicketUpdate` supports attachments, but the staff `updates` endpoint only permits `body`, `update_type`, and `is_internal`. The app shows the request's existing attachment only.
- **Ticket update authors**: updates expose `author_type`/`author_id` but no name, so the timeline labels them "You", "Team", or "Resident".
- **Profile update permits `email` and `active`**: the app only sends name, mobile number, and avatar.
