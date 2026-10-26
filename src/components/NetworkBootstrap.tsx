import { useEffect } from 'react';
import * as Network from 'expo-network';
import { onlineManager } from '@tanstack/react-query';
import { useUi } from '@/store/ui';

function isOnline(state: Network.NetworkState) {
  if (state.isConnected === false) return false;
  if (state.isInternetReachable === false) return false;
  return Boolean(state.isConnected);
}

export function NetworkBootstrap() {
  useEffect(() => {
    let mounted = true;

    function apply(state: Network.NetworkState) {
      if (!mounted) return;
      const online = isOnline(state);
      useUi.getState().setOnline(online);
      onlineManager.setOnline(online);
    }

    void Network.getNetworkStateAsync().then((state) => {
      if (mounted) apply(state);
    });
    const sub = Network.addNetworkStateListener(apply);

    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return null;
}
