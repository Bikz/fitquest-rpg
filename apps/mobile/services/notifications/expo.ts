import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

const getProjectId = () => {
  return Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId || undefined;
};

export const getPermissionStatus = async () => {
  const settings = await Notifications.getPermissionsAsync();
  return settings.status;
};

export const requestPermission = async () => {
  const settings = await Notifications.requestPermissionsAsync();
  return settings.status;
};

export const getExpoPushTokenAsync = async () => {
  if (!Device.isDevice || Platform.OS === "web") {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const projectId = getProjectId();
  const tokenResponse = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined,
  );

  return tokenResponse.data;
};

export const isPhysicalDevice = () => Device.isDevice;
