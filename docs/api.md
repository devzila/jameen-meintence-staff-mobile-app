# API

All paths are under `/v1/maintenance_staff` (`PORTAL` in `src/constants/config.ts`). Routes live in `jameen-api/config/routes/maintenance_staff.rb`.

## Wired endpoints

| Method        | Path                                                                | Used by                                                                              |
| ------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| GET           | `/companies/:slug`                                                  | Company screen, reset link                                                           |
| POST          | `/auth/session`                                                     | Login                                                                                |
| POST          | `/auth/session/refresh`                                             | API client                                                                           |
| DELETE        | `/auth/session`                                                     | Sign out                                                                             |
| GET           | `/auth/sessions`                                                    | Active devices                                                                       |
| DELETE        | `/auth/sessions/:id`                                                | Revoke device                                                                        |
| POST          | `/auth/passwords`                                                   | Forgot password                                                                      |
| PUT           | `/auth/passwords/:token`                                            | Reset password                                                                       |
| GET           | `/profile`                                                          | Profile (staff at the root, includes `properties`)                                   |
| PUT           | `/profile`                                                          | Edit profile, multipart `member[name                                                 | mobile_number | avatar]` |
| PUT           | `/passwords`                                                        | Change password, `{ profile: { current_password, new_password, confirm_password } }` |
| GET           | `/maintenance/requests`                                             | Home counts, request list                                                            |
| GET           | `/maintenance/requests/:id`                                         | Request detail                                                                       |
| PUT           | `/maintenance/requests/:id/{acknowledge,start,hold,resume,resolve}` | Status actions                                                                       |
| GET / POST    | `/maintenance/requests/:id/comments`                                | Activity, comments                                                                   |
| GET / POST    | `/maintenance/requests/:id/updates`                                 | Activity timeline, internal notes                                                    |
| POST / DELETE | `/notifications/subscriptions`                                      | Expo push registration                                                               |
| POST          | `/notifications/:id/ack`                                            | Notification tap                                                                     |

`/maintenance/requests/:id/inprogress` and `/completed` are the PWA's legacy actions; the app uses the newer transition endpoints.

## Request list filters

The list is Ransack-filtered on integer enum values, because Ransack compares the stored column:

| Filter        | Query                                   |
| ------------- | --------------------------------------- |
| Single status | `q[status_eq]=<code>`                   |
| All open      | `q[status_in][]=0&q[status_in][]=7&…`   |
| High priority | `q[priority_in][]=2&q[priority_in][]=3` |
| SLA breached  | `q[sla_breached_eq]=true`               |

Status codes: `requested 0, in_progress 1, cancelled 2, resolved 3, reopen 4, closed 5, draft 6, acknowledged 7, assigned 8, on_hold 9`. Priority codes: `low 0, normal 1, high 2, urgent 3`.

The server scope already limits rows to the staff member's properties (or all company properties when none are assigned), to requests that are unassigned or assigned to them, and excludes closed and cancelled requests.

Home counts use `limit=1` and read `pagination.total_entries`.

## Status transitions

`src/lib/requestStatus.ts` mirrors `Maintenance::RequestStateMachine`:

| Action      | Allowed from                                            | To                                          |
| ----------- | ------------------------------------------------------- | ------------------------------------------- |
| acknowledge | requested, reopen                                       | acknowledged                                |
| start       | assigned, requested, acknowledged, reopen               | in_progress                                 |
| hold        | assigned, in_progress                                   | on_hold (`hold_reason` required in the app) |
| resume      | on_hold                                                 | in_progress                                 |
| resolve     | in_progress, assigned, requested, acknowledged, on_hold | resolved (`actual_cost` optional)           |

Success returns `200 { message, data: request }`; an invalid transition returns `422 { message: "Cannot <event> from <status>" }`, shown as a toast. Every transition creates a `status_change` ticket update, which appears in the activity timeline.

## Activity

The timeline merges `comments` and `updates`, newest first. Posting from the composer creates a comment (resident-visible) or, with the internal toggle on, a ticket update with `update_type: internal_note, is_internal: true`.

Polymorphic author columns hold the STI base class: `Actor` for staff/admins and `Member` for residents. The app labels an `Actor` whose id matches the signed-in staff as "You".
