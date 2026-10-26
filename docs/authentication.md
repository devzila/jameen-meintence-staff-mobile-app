# Authentication

Matches `jameen-api/docs/frontend_auth_integration.md` and the maintenance staff PWA.

## Flow

```
Company slug (GET /v1/maintenance_staff/companies/:slug)
        ↓
Email + password (POST /v1/maintenance_staff/auth/session)
        ↓
access JWT (~15 min) + rotating refresh (~90 days)
        ↓
Home
```

## Storage

| Secret                 | Store                                                |
| ---------------------- | ---------------------------------------------------- |
| Access token           | Expo SecureStore (`jameen.maintenance.accessToken`)  |
| Refresh token          | Expo SecureStore (`jameen.maintenance.refreshToken`) |
| Expo push token        | Expo SecureStore (`jameen.maintenance.pushToken`)    |
| Company slug + company | AsyncStorage (`jameen.maintenance.org`)              |
| Language               | AsyncStorage (`jameen.maintenance.locale`)           |

Do not put JWTs in AsyncStorage.

## Client behaviour

1. Login `POST /v1/maintenance_staff/auth/session` with `device_name: maintenance-staff-mobile-ios/ios` (or `-android/android`).
2. Before each request, if the access token expires within 90 seconds, refresh first.
3. On **401**, refresh once (`POST …/auth/session/refresh` with `{ refresh_token }`), then retry the original request. Concurrent requests share one refresh.
4. If refresh returns 401/403, clear SecureStore and send the user to login. Other refresh failures (5xx, network) keep the session.
5. Sign out: deactivate this device's push subscription, `DELETE /v1/maintenance_staff/auth/session`, clear local tokens and the query cache.

Send the `company-slug` header on every portal request except `GET /companies/:slug`.

## Devices

`/profile/sessions` lists `GET /auth/sessions` and revokes others with `DELETE /auth/sessions/:id`. Revoking the current device signs out locally.

## Reset password

Email links target `/reset-password?token=...&company-slug=...`. The app handles both `https://maintenance.jameen.com/reset-password` (Android app link) and `jameen-maintenance://reset-password`. Token lifetime is **1 hour**.
