import { apiFetch } from '@/services/api/client';
import {
  countRequests,
  createComment,
  createInternalNote,
  fetchRequests,
  transitionRequest,
} from '@/services/api/requests';

jest.mock('@/services/api/client', () => ({
  apiFetch: jest.fn(),
}));

const apiFetchMock = apiFetch as jest.MockedFunction<typeof apiFetch>;
const base = '/v1/maintenance_staff/maintenance/requests';

describe('maintenance requests api', () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
    apiFetchMock.mockResolvedValue({ data: [], pagination: { total_entries: 4 } });
  });

  it('pages the list with Ransack filters', async () => {
    await fetchRequests({ page: 2, query: { 'q[status_eq]': 1 } });
    expect(apiFetchMock).toHaveBeenCalledWith(base, {
      query: { page: 2, limit: 10, 'q[status_eq]': 1 },
      signal: undefined,
    });
  });

  it('counts with a one-row page', async () => {
    await expect(countRequests({ 'q[status_eq]': 9 })).resolves.toBe(4);
    expect(apiFetchMock.mock.calls[0][1]).toMatchObject({ query: { limit: 1 } });
  });

  it('sends hold reasons and drops empty transition params', async () => {
    apiFetchMock.mockResolvedValue({ data: { id: 5 } });
    await transitionRequest(5, 'hold', { hold_reason: 'awaiting_parts' });
    expect(apiFetchMock).toHaveBeenCalledWith(`${base}/5/hold`, {
      method: 'PUT',
      body: { hold_reason: 'awaiting_parts' },
    });

    await transitionRequest(5, 'resolve', { actual_cost: '' });
    expect(apiFetchMock).toHaveBeenLastCalledWith(`${base}/5/resolve`, {
      method: 'PUT',
      body: {},
    });
  });

  it('posts comments and internal notes to their own endpoints', async () => {
    apiFetchMock.mockResolvedValue({ data: {} });
    await createComment(5, 'Fixed');
    expect(apiFetchMock).toHaveBeenCalledWith(`${base}/5/comments`, {
      method: 'POST',
      body: { comment: { comment: 'Fixed' } },
    });

    await createInternalNote(5, 'Needs a plumber');
    expect(apiFetchMock).toHaveBeenLastCalledWith(`${base}/5/updates`, {
      method: 'POST',
      body: {
        ticket_update: { body: 'Needs a plumber', update_type: 'internal_note', is_internal: true },
      },
    });
  });
});
