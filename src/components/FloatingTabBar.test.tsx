import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { FloatingTabBar } from './FloatingTabBar';
import type { BottomTabBarProps } from 'expo-router/tabs';

jest.setTimeout(15000);

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
jest.mock('@/lib/fonts', () => ({ useAppFonts: () => ({}) }));

function props(prevented = false) {
  return {
    state: {
      index: 0,
      routes: [
        { key: 'home-key', name: 'home' },
        { key: 'requests-key', name: 'requests' },
      ],
    },
    descriptors: {
      'home-key': { options: { title: 'Home' } },
      'requests-key': { options: { title: 'Requests' } },
    },
    emitter: { emit: jest.fn(() => ({ defaultPrevented: prevented })) },
    navigateToTab: jest.fn(),
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  };
}

it('uses the SDK 58 tab callback with the route key and emits tab events', async () => {
  const value = props();
  const view = await render(<FloatingTabBar {...(value as unknown as BottomTabBarProps)} />);
  await fireEvent.press(view.getByRole('tab', { name: 'Requests' }));
  expect(value.emitter.emit).toHaveBeenCalledWith({
    type: 'tabPress',
    target: 'requests-key',
    canPreventDefault: true,
  });
  expect(value.navigateToTab).toHaveBeenCalledWith('requests-key');
  await fireEvent(view.getByRole('tab', { name: 'Requests' }), 'longPress');
  expect(value.emitter.emit).toHaveBeenCalledWith({ type: 'tabLongPress', target: 'requests-key' });
});

it('does not navigate when a tab event is prevented or the tab is already focused', async () => {
  const value = props(true);
  const view = await render(<FloatingTabBar {...(value as unknown as BottomTabBarProps)} />);
  await fireEvent.press(view.getByRole('tab', { name: 'Requests' }));
  expect(value.navigateToTab).not.toHaveBeenCalled();
  value.emitter.emit.mockReturnValue({ defaultPrevented: false });
  await fireEvent.press(view.getByRole('tab', { name: 'Home' }));
  expect(value.navigateToTab).not.toHaveBeenCalled();
});
