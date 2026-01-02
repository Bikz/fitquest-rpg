import { useAuth } from "@clerk/clerk-expo";
import type { PermissionStatus } from "expo-notifications";
import { useCallback, useEffect, useState } from "react";
import { Linking, Platform } from "react-native";
import { useApiRequest } from "@/services/api/client";
import { registerPushToken } from "@/services/api/notifications";
import {
  getExpoPushTokenAsync,
  getPermissionStatus,
  isPhysicalDevice,
  requestPermission,
} from "@/services/notifications/expo";

type PushStatus = "unknown" | "granted" | "denied";

const mapStatus = (status: PermissionStatus): PushStatus => {
  if (status === "granted") return "granted";
  if (status === "denied") return "denied";
  return "unknown";
};

const usePushNotifications = () => {
  const { isSignedIn } = useAuth();
  const { request } = useApiRequest();
  const [status, setStatus] = useState<PushStatus>("unknown");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const deviceSupported = isPhysicalDevice();

  const syncToken = useCallback(
    async (prompt: boolean) => {
      if (!isSignedIn || Platform.OS === "web") {
        return;
      }

      setLoading(true);

      try {
        let permission = await getPermissionStatus();
        if (permission !== "granted" && prompt) {
          permission = await requestPermission();
        }
        setStatus(mapStatus(permission));

        if (permission !== "granted" || !deviceSupported) {
          return;
        }

        const expoToken = await getExpoPushTokenAsync();
        if (!expoToken) {
          return;
        }

        setToken(expoToken);
        await registerPushToken(request, {
          token: expoToken,
          platform: Platform.OS,
        });
      } finally {
        setLoading(false);
      }
    },
    [deviceSupported, isSignedIn, request],
  );

  useEffect(() => {
    void syncToken(false);
  }, [syncToken]);

  const enable = useCallback(async () => {
    await syncToken(true);
  }, [syncToken]);

  const openSettings = useCallback(() => {
    if (Platform.OS === "web") return;
    void Linking.openSettings();
  }, []);

  return {
    status,
    token,
    loading,
    deviceSupported,
    enable,
    openSettings,
  };
};

export default usePushNotifications;
