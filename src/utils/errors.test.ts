import { ApiError, isNetworkFailure, NETWORK_FAILURE_MESSAGE, toUserMessage } from '@/utils/errors';

describe('network failures', () => {
  it('treats a dropped fetch as Needs network', () => {
    const lost = new Error('fetch failed: UnexpectedException: The network connection was lost.');
    expect(isNetworkFailure(lost)).toBe(true);
    expect(toUserMessage(lost)).toBe(NETWORK_FAILURE_MESSAGE);
    expect(isNetworkFailure(new ApiError(lost.message, 0))).toBe(true);
  });

  it('leaves validation errors alone', () => {
    const err = new ApiError('Enter a valid 10-digit phone number', 422);
    expect(isNetworkFailure(err)).toBe(false);
    expect(toUserMessage(err)).toBe('Enter a valid 10-digit phone number');
  });
});
