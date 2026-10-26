import { requestRouteFromNotification, sameRoute } from '@/lib/routes';

describe('sameRoute', () => {
  it('ignores route groups and trailing slashes', () => {
    expect(sameRoute('/home', '/home/')).toBe(true);
    expect(sameRoute('/(staff)/(tabs)/requests', '/requests')).toBe(true);
    expect(sameRoute('/(staff)/requests/12', '/requests')).toBe(false);
  });
});

describe('requestRouteFromNotification', () => {
  it('reads the request id from the url the API sends', () => {
    expect(requestRouteFromNotification({ url: '/maintenance/requests/42' })).toBe('/requests/42');
    expect(requestRouteFromNotification({ url: 'https://x.test/requests/7?x=1' })).toBe(
      '/requests/7',
    );
  });

  it('falls back to entity type and id', () => {
    expect(
      requestRouteFromNotification({ entity_type: 'Maintenance::Request', entity_id: 9 }),
    ).toBe('/requests/9');
    expect(
      requestRouteFromNotification({ entity_type: 'Maintenance::Request', entity_id: '11' }),
    ).toBe('/requests/11');
  });

  it('returns null for unrelated payloads', () => {
    expect(requestRouteFromNotification({ entity_type: 'Post', entity_id: 3 })).toBeNull();
    expect(requestRouteFromNotification(undefined)).toBeNull();
  });
});
