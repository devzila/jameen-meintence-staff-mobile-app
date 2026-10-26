import type { BadgeTone } from '@/components/ui/Badge';
import type {
  HoldReason,
  MaintenanceRequest,
  RequestAction,
  RequestPriority,
  RequestStatus,
} from '@/types/maintenance';

/** Integer values of the `Maintenance::Request#status` enum; Ransack filters need these. */
export const STATUS_CODES: Record<RequestStatus, number> = {
  requested: 0,
  in_progress: 1,
  cancelled: 2,
  resolved: 3,
  reopen: 4,
  closed: 5,
  draft: 6,
  acknowledged: 7,
  assigned: 8,
  on_hold: 9,
};

export const PRIORITY_CODES: Record<RequestPriority, number> = {
  low: 0,
  normal: 1,
  high: 2,
  urgent: 3,
};

export const TODO_STATUSES: RequestStatus[] = ['requested', 'acknowledged', 'assigned', 'reopen'];

export const OPEN_STATUSES: RequestStatus[] = [...TODO_STATUSES, 'in_progress', 'on_hold'];

export const HOLD_REASONS: HoldReason[] = [
  'awaiting_parts',
  'awaiting_resident_response',
  'awaiting_vendor_visit',
];

export type StatusFilter = 'open' | RequestStatus;

export const STATUS_FILTERS: StatusFilter[] = [
  'open',
  'requested',
  'acknowledged',
  'assigned',
  'in_progress',
  'on_hold',
  'reopen',
  'resolved',
];

/** Ransack query params for a list filter. */
export function statusQuery(filter: StatusFilter): Record<string, number | number[]> {
  if (filter === 'open') {
    return { 'q[status_in][]': OPEN_STATUSES.map((s) => STATUS_CODES[s]) };
  }
  return { 'q[status_eq]': STATUS_CODES[filter] };
}

/** Mirrors the AASM transitions in `Maintenance::RequestStateMachine`. */
const TRANSITIONS: Record<RequestAction, RequestStatus[]> = {
  acknowledge: ['requested', 'reopen'],
  start: ['assigned', 'requested', 'acknowledged', 'reopen'],
  hold: ['assigned', 'in_progress'],
  resume: ['on_hold'],
  resolve: ['in_progress', 'assigned', 'requested', 'acknowledged', 'on_hold'],
};

export function canPerform(action: RequestAction, status: RequestStatus): boolean {
  return TRANSITIONS[action].includes(status);
}

export function availableActions(status: RequestStatus): RequestAction[] {
  return (Object.keys(TRANSITIONS) as RequestAction[]).filter((action) =>
    canPerform(action, status),
  );
}

/** The single next step a technician most likely wants for this status. */
export function primaryAction(status: RequestStatus): RequestAction | null {
  if (status === 'in_progress') return 'resolve';
  if (status === 'on_hold') return 'resume';
  if (canPerform('start', status)) return 'start';
  return null;
}

export function secondaryActions(status: RequestStatus): RequestAction[] {
  const primary = primaryAction(status);
  return availableActions(status).filter((action) => action !== primary);
}

export function statusTone(status: RequestStatus): BadgeTone {
  switch (status) {
    case 'resolved':
    case 'closed':
      return 'success';
    case 'in_progress':
      return 'info';
    case 'on_hold':
    case 'reopen':
      return 'warning';
    case 'cancelled':
      return 'danger';
    default:
      return 'neutral';
  }
}

export function priorityTone(priority?: RequestPriority | null): BadgeTone {
  if (priority === 'urgent') return 'danger';
  if (priority === 'high') return 'warning';
  return 'neutral';
}

export function isOpenStatus(status: RequestStatus) {
  return OPEN_STATUSES.includes(status);
}

/** SLA is breached when the API says so, or the resolution deadline has passed on an open ticket. */
export function isSlaBreached(request: MaintenanceRequest, now = Date.now()): boolean {
  if (request.sla_breached) return true;
  if (!isOpenStatus(request.status) || !request.sla_resolution_due_at) return false;
  const due = Date.parse(request.sla_resolution_due_at);
  return Number.isFinite(due) && due < now;
}

export function locationLabel(request: MaintenanceRequest): string {
  const unit = request.maintainable;
  const parts = [unit?.unit_no || unit?.name, unit?.building?.name, request.property?.name].filter(
    (part): part is string => Boolean(part && String(part).trim()),
  );
  return Array.from(new Set(parts)).join(' · ');
}
