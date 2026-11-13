# SDK 58 upgrade

The Maintenance Staff app moves from SDK 57 to SDK 58, matching the SDK generation used by the Resident and Security apps. App/package version 1.1.0 separates the new native runtime from 1.0.0 under the existing `appVersion` runtime policy.

## Implemented

- Expo and native dependencies aligned using `expo install --fix`.
- Resolved versions: Expo 58.0.23, React Native 0.88.1, React 19.3.0, Router 58.0.30, Jest 30.5.2 and jest-expo 58.0.14 (see lockfile).
- Custom tab bar uses the public `expo-router/tabs` types and the SDK 58 `emitter`/`navigateToTab` callbacks. Regression tests cover navigation, prevented events, focused tabs and long presses.
- FlatList footer uses the supported optional value under React Native's strict types.
- Notification handler retains banner/list/sound/badge behaviour and removes deprecated `shouldShowAlert`.
- Persisted company, locale and onboarding stores use a server-safe storage adapter for static web rendering, while keeping the existing native/browser storage keys.
- Compatible transitive node-forge update to 1.4.3 removes the high-severity advisory observed during installation. npm still reports 31 advisories (1 low, 30 moderate); these require separate review rather than forced major dependency changes.
- README, architecture and agent documentation now reference SDK 58.

## Validation

- Baseline SDK 57: 42 tests in 12 suites, type checking and lint passed.
- SDK 58: 44 tests in 13 suites, type checking and lint passed.
- Expo Doctor: 20/20 checks passed.
- Production export: Android and iOS Hermes bundles plus web static rendering (33 routes) passed. Local output: `/tmp/maintenance-sdk58-export-final`.
- `expo prebuild --no-install`: Android and iOS project generation passed. Generated directories remain ignored under the existing continuous native generation workflow.
- Native compilation and device QA remain outstanding: this environment has neither Java nor Xcode available.

## Build and device sign-off

1. Build development clients for Android and iOS using the existing development profile; SDK 57 clients must be replaced with SDK 58 clients. Cloud builds require the project's EAS account/credentials and may consume build quota.
2. Build a release-mode preview. Confirm API environment and signing configuration, and set appropriate Android versionCode/iOS buildNumber before distribution.
3. Test login, company switching, token refresh, logout and session restoration.
4. Compare dashboard counts and filtered request lists with the backend; verify pagination, details and attachments.
5. Exercise acknowledge/start/hold/resume/resolve, every hold reason, optional actual cost, comments and internal-note privacy. Confirm the Resident App and PM Portal reflect saved changes.
6. Test profile edits, camera/gallery denial and upload, password reset links, password change and session revocation.
7. On physical devices, verify notification registration and delivery, foreground/background/cold-start navigation, denied permissions, and logout/account switching. Android Expo Go deliberately disables remote push integration in this app; use a development build.
8. Verify offline/reconnect behaviour, keyboard/tab navigation, all supported languages and saved settings after terminating/reopening the app.
9. Test upgrading from the previous installed binary to retain stored sessions/company/locale. Keep API and storage contracts backwards-compatible.
10. Release internally first and monitor errors. An SDK change requires a new binary, not an OTA-only update. Retain the previous release and its compatible runtime/update channel for rollback.

## Known build warnings

Sentry 8.28 probes Expo Router's removed private `global-state/router-store` path. Metro reports a package-resolution warning; Sentry catches the missing module. No node_modules patch or resolution suppression is applied. Verify navigation tracing/error reporting on the native release build before sign-off.

## References

- https://docs.expo.dev/versions/v58.0.0/
- https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/
- https://expo.dev/changelog/sdk-58
- https://docs.expo.dev/eas-update/runtime-versions/
