import {
  availableActions,
  canPerform,
  isSlaBreached,
  locationLabel,
  primaryAction,
  secondaryActions,
  statusQuery,
} from '@/lib/requestStatus';
import type { MaintenanceRequest } from '@/types/maintenance';

function request(overrides: Partial<MaintenanceRequest> = {}): MaintenanceRequest {
  return { id: 1, title: 'Leaking tap', status: 'requested', ...overrides };
}

describe('request transitions mirror the API state machine', () => {
  it('offers acknowledge, start, and resolve on a new request', () => {
    expect(availableActions('requested')).toEqual(['acknowledge', 'start', 'resolve']);
    expect(primaryAction('requested')).toBe('start');
    expect(secondaryActions('requested')).toEqual(['acknowledge', 'resolve']);
  });

  it('only allows hold and resolve while work is in progress', () => {
    expect(availableActions('in_progress')).toEqual(['hold', 'resolve']);
    expect(primaryAction('in_progress')).toBe('resolve');
    expect(secondaryActions('in_progress')).toEqual(['hold']);
  });

  it('resumes or resolves a request on hold', () => {
    expect(availableActions('on_hold')).toEqual(['resume', 'resolve']);
    expect(primaryAction('on_hold')).toBe('resume');
  });

  it('allows hold from assigned but not acknowledge', () => {
    expect(canPerform('hold', 'assigned')).toBe(true);
    expect(canPerform('acknowledge', 'assigned')).toBe(false);
  });

  it('has no actions on terminal statuses', () => {
    for (const status of ['resolved', 'closed', 'cancelled'] as const) {
      expect(availableActions(status)).toEqual([]);
      expect(primaryAction(status)).toBeNull();
    }
  });
});

describe('statusQuery', () => {
  it('sends the integer enum value for a single status', () => {
    expect(statusQuery('on_hold')).toEqual({ 'q[status_eq]': 9 });
  });

  it('sends every open status for the open filter', () => {
    expect(statusQuery('open')).toEqual({ 'q[status_in][]': [0, 7, 8, 4, 1, 9] });
  });
});

describe('isSlaBreached', () => {
  const now = Date.parse('2026-10-26T10:00:00Z');

  it('trusts the API flag', () => {
    expect(isSlaBreached(request({ sla_breached: true }), now)).toBe(true);
  });

  it('flags open requests past their resolution deadline', () => {
    expect(isSlaBreached(request({ sla_resolution_due_at: '2026-10-26T09:00:00Z' }), now)).toBe(
      true,
    );
    expect(isSlaBreached(request({ sla_resolution_due_at: '2026-10-26T11:00:00Z' }), now)).toBe(
      false,
    );
  });

  it('ignores deadlines on resolved requests', () => {
    expect(
      isSlaBreached(
        request({ status: 'resolved', sla_resolution_due_at: '2026-10-26T09:00:00Z' }),
        now,
      ),
    ).toBe(false);
  });
});

describe('locationLabel', () => {
  it('joins unit, building and property without duplicates', () => {
    expect(
      locationLabel(
        request({
          maintainable: { id: 3, unit_no: 'A-101', building: { id: 2, name: 'Tower A' } },
          property: { id: 1, name: 'Suncity' },
        }),
      ),
    ).toBe('A-101 · Tower A · Suncity');
    expect(locationLabel(request({ property: { id: 1, name: 'Suncity' } }))).toBe('Suncity');
  });
});
