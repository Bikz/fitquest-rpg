import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

export type NetworkStatus = {
  isConnected: boolean;
  isInternetReachable: boolean;
};

export const useNetworkStatus = (): NetworkStatus => {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setStatus({
        isConnected: Boolean(state.isConnected),
        isInternetReachable: Boolean(state.isInternetReachable),
      });
    });

    return () => unsubscribe();
  }, []);

  return status;
};
