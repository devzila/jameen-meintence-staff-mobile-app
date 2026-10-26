import { pickNextRoute, useAuth } from '@/store/auth';
import { useOrg } from '@/store/org';

describe('navigation guards', () => {
  it('keeps authenticated staff on the staff app', () => {
    useOrg.setState({ slug: 'suncity' });
    useAuth.setState({
      isAuthenticated: true,
      accessToken: 'a',
      refreshToken: 'r',
    });
    expect(pickNextRoute()).toBe('/home');
  });

  it('sends staff with a company to login when the session is missing', () => {
    useOrg.setState({ slug: 'suncity' });
    useAuth.setState({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
    });
    expect(pickNextRoute()).toBe('/login');
  });

  it('sends staff without a company to company entry', () => {
    useOrg.setState({ slug: null });
    useAuth.setState({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
    });
    expect(pickNextRoute()).toBe('/company');
  });
});
