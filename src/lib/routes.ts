function normalizePath(value: string) {
  return (
    value
      .split('?')[0]
      .replace(/\/\([^/]+\)/g, '')
      .replace(/\/+$/, '') || '/'
  );
}

export function sameRoute(pathname: string, href: string) {
  return normalizePath(pathname) === normalizePath(href);
}

/** Maps a push payload (`data.url` or `entity_type`/`entity_id`) to an in-app request route. */
export function requestRouteFromNotification(
  data: Record<string, unknown> | undefined | null,
): `/requests/${string}` | null {
  if (!data) return null;
  const url = typeof data.url === 'string' ? data.url : '';
  const fromUrl = url.match(/\/(?:maintenance\/)?requests\/(\d+)/);
  if (fromUrl) return `/requests/${fromUrl[1]}`;

  const entityType = typeof data.entity_type === 'string' ? data.entity_type : '';
  const entityId = data.entity_id;
  if (
    entityType === 'Maintenance::Request' &&
    (typeof entityId === 'number' || (typeof entityId === 'string' && /^\d+$/.test(entityId)))
  ) {
    return `/requests/${entityId}`;
  }
  return null;
}
