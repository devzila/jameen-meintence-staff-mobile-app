import type { RequestComment, TicketUpdate } from '@/types/maintenance';

export type ActivityAuthor = 'you' | 'resident' | 'team' | 'system';

export type ActivityItem = {
  key: string;
  kind: 'comment' | 'status' | 'note' | 'update';
  body: string;
  author: ActivityAuthor;
  authorName?: string | null;
  createdAt: string;
  internal: boolean;
  toState?: string;
};

/**
 * Polymorphic `*_type` columns hold the STI base class: `Actor` for staff and admins,
 * `Member` for residents.
 */
function authorFor(
  type: string | null | undefined,
  id: number | null | undefined,
  staffId?: number,
): ActivityAuthor {
  const kind = (type ?? '').toLowerCase();
  if (!kind) return 'system';
  if (kind.includes('member') || kind.includes('resident')) return 'resident';
  if (kind.includes('actor') && id != null && id === staffId) return 'you';
  return 'team';
}

/** Merges comments and ticket updates into one newest-first timeline. */
export function buildActivity(
  comments: RequestComment[],
  updates: TicketUpdate[],
  staffId?: number,
): ActivityItem[] {
  const fromComments: ActivityItem[] = comments.map((comment) => ({
    key: `comment-${comment.id}`,
    kind: 'comment',
    body: comment.comment,
    author: authorFor(comment.userable_type, comment.userable?.id, staffId),
    authorName: comment.userable?.name,
    createdAt: comment.created_at ?? '',
    internal: false,
  }));

  const fromUpdates: ActivityItem[] = updates.map((update) => ({
    key: `update-${update.id}`,
    kind:
      update.update_type === 'status_change'
        ? 'status'
        : update.update_type === 'internal_note'
          ? 'note'
          : 'update',
    body: update.body ?? '',
    author: authorFor(update.author_type, update.author_id, staffId),
    createdAt: update.created_at,
    internal: Boolean(update.is_internal),
    toState: update.metadata?.to_state,
  }));

  return [...fromComments, ...fromUpdates].sort(
    (a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0),
  );
}
