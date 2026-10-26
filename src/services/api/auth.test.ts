import { changePassword, revokeSession } from '@/services/api/auth';
import { apiFetch } from '@/services/api/client';
import { unwrapStaff } from '@/services/api/profile';

jest.mock('@/services/api/client', () => ({
  apiFetch: jest.fn(),
}));

const apiFetchMock = apiFetch as jest.MockedFunction<typeof apiFetch>;

describe('maintenance staff account api', () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
    apiFetchMock.mockResolvedValue({ message: 'ok' });
  });

  it('sends the current and new passwords to the maintenance portal', async () => {
    await changePassword({
      current_password: 'Password123',
      new_password: 'Password456',
      confirm_password: 'Password456',
    });
    expect(apiFetchMock).toHaveBeenCalledWith('/v1/maintenance_staff/passwords', {
      method: 'PUT',
      body: {
        profile: {
          current_password: 'Password123',
          new_password: 'Password456',
          confirm_password: 'Password456',
        },
      },
    });
  });

  it('revokes a device session by its sid', async () => {
    await revokeSession('abc/123');
    expect(apiFetchMock).toHaveBeenCalledWith('/v1/maintenance_staff/auth/sessions/abc%2F123', {
      method: 'DELETE',
    });
  });
});

describe('unwrapStaff', () => {
  it('reads the staff from the root or the data envelope', () => {
    expect(unwrapStaff({ id: 1, name: 'Ravi' })?.name).toBe('Ravi');
    expect(unwrapStaff({ message: 'ok', data: { id: 2, name: 'Asha' } })?.id).toBe(2);
    expect(unwrapStaff({ message: 'nope' })).toBeNull();
  });
});
