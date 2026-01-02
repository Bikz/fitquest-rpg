import { STORAGE_KEYS } from "@/data/storage/keys";
import { storage } from "@/data/storage/kv";
import useAppConfig from "@/features/app/hooks/useAppConfig";
import useAppVersionCheck from "@/features/app/hooks/useAppVersionCheck";
import usePushNotifications from "@/features/notifications/hooks/usePushNotifications";
import Colors from "@/ui/theme/colors";
import { useAuth } from "@clerk/clerk-expo";
import { useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useMMKVBoolean } from "react-native-mmkv";

const SettingsScreen = () => {
  const { signOut } = useAuth();
  const [testProEnabled, setTestProEnabled] = useMMKVBoolean(STORAGE_KEYS.testProEnabled, storage);
  const [tapCount, setTapCount] = useState(0);
  const [showTesting, setShowTesting] = useState(false);
  const {
    config,
    refresh: refreshConfig,
    loading: configLoading,
    error: configError,
  } = useAppConfig();
  const {
    currentVersion,
    info: versionInfo,
    needsUpdate,
    requiresUpdate,
    refresh: refreshVersion,
    loading: versionLoading,
    error: versionError,
  } = useAppVersionCheck();
  const {
    status: pushStatus,
    loading: pushLoading,
    deviceSupported,
    enable: enablePush,
    openSettings: openPushSettings,
  } = usePushNotifications();

  const handleAboutPress = () => {
    const nextCount = tapCount + 1;
    setTapCount(nextCount);
    if (nextCount >= 7) {
      setShowTesting(true);
    }
  };
  const handleVersionPress = () => {
    handleAboutPress();
    if (versionInfo?.updateUrl && (needsUpdate || requiresUpdate)) {
      void Linking.openURL(versionInfo.updateUrl);
      return;
    }
    void refreshVersion();
  };

  const handleConfigPress = () => {
    void refreshConfig();
  };

  const updateLabel = versionLoading
    ? "Checking..."
    : versionError
      ? "Unable to check updates"
      : requiresUpdate
        ? "Update required"
        : needsUpdate
          ? "Update available"
          : "Up to date";
  const configKeys = Object.keys(config ?? {}).length;
  const configLabel = configLoading
    ? "Refreshing..."
    : configError
      ? "Refresh failed"
      : `${configKeys} keys`;
  const notificationsLabel = !deviceSupported
    ? "Requires a physical device"
    : pushStatus === "granted"
      ? "Enabled"
      : pushStatus === "denied"
        ? "Off"
        : "Not enabled";
  const notificationsAction = pushStatus === "granted" ? "Manage" : "Enable";
  const handleNotificationsPress = () => {
    if (!deviceSupported || pushLoading) return;
    if (pushStatus === "granted") {
      openPushSettings();
      return;
    }
    void enablePush();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.row} onPress={() => signOut()}>
          <Text style={styles.rowText}>Log out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <TouchableOpacity style={styles.row} onPress={handleNotificationsPress}>
          <View style={styles.rowContent}>
            <Text style={styles.rowText}>Push notifications</Text>
            <Text style={styles.rowSubText}>{notificationsLabel}</Text>
          </View>
          <Text style={styles.rowActionText}>{notificationsAction}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>
        <TouchableOpacity style={styles.row} onPress={handleAboutPress}>
          <Text style={styles.rowText}>About AppBase</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={handleVersionPress}>
          <View style={styles.rowContent}>
            <Text style={styles.rowText}>Version {currentVersion}</Text>
            <Text style={styles.rowSubText}>{updateLabel}</Text>
          </View>
          <Text style={styles.rowActionText}>
            {needsUpdate || requiresUpdate ? "Update" : "Check"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={handleConfigPress}>
          <View style={styles.rowContent}>
            <Text style={styles.rowText}>Remote config</Text>
            <Text style={styles.rowSubText}>{configLabel}</Text>
          </View>
          <Text style={styles.rowActionText}>Refresh</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>Terms</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>Privacy</Text>
        </TouchableOpacity>
      </View>

      {showTesting && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Testing</Text>
          <View style={styles.row}>
            <Text style={styles.rowText}>Test Pro Mode</Text>
            <Switch
              value={Boolean(testProEnabled)}
              onValueChange={(value) => setTestProEnabled(value)}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  content: {
    padding: 24,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    textTransform: "uppercase",
    color: Colors.grey,
    letterSpacing: 1,
  },
  row: {
    backgroundColor: Colors.input,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowText: {
    fontSize: 16,
    color: Colors.dark,
  },
  rowContent: {
    flex: 1,
    gap: 4,
  },
  rowSubText: {
    fontSize: 12,
    color: Colors.grey,
  },
  rowActionText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
});

export default SettingsScreen;
