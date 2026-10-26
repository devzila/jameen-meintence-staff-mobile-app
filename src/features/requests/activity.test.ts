import { buildActivity } from '@/features/requests/activity';

describe('buildActivity', () => {
  it('merges comments and updates newest first and labels authors', () => {
    const items = buildActivity(
      [
        {
          id: 1,
          comment: 'Please come after 5pm',
          userable_type: 'Member',
          userable: { id: 40, name: 'Asha' },
          created_at: '2026-10-26T08:00:00Z',
        },
        {
          id: 2,
          comment: 'On my way',
          userable_type: 'Actor',
          userable: { id: 7, name: 'Ravi' },
          created_at: '2026-10-26T09:00:00Z',
        },
      ],
      [
        {
          id: 10,
          request_id: 5,
          author_type: 'Actor',
          author_id: 7,
          update_type: 'status_change',
          body: 'Status changed to In progress',
          is_internal: false,
          metadata: { from_state: 'requested', to_state: 'in_progress' },
          created_at: '2026-10-26T08:30:00Z',
        },
        {
          id: 11,
          request_id: 5,
          author_type: 'Actor',
          author_id: 99,
          update_type: 'internal_note',
          body: 'Bring a spare valve',
          is_internal: true,
          created_at: '2026-10-26T07:00:00Z',
        },
      ],
      7,
    );

    expect(items.map((item) => item.key)).toEqual([
      'comment-2',
      'update-10',
      'comment-1',
      'update-11',
    ]);
    expect(items[0]).toMatchObject({ kind: 'comment', author: 'you' });
    expect(items[1]).toMatchObject({ kind: 'status', toState: 'in_progress' });
    expect(items[2]).toMatchObject({ author: 'resident', authorName: 'Asha' });
    expect(items[3]).toMatchObject({ kind: 'note', author: 'team', internal: true });
  });
});
