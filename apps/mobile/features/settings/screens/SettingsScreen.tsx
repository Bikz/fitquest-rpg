import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { STORAGE_KEYS } from "@/data/storage/keys";
import { storage } from "@/data/storage/kv";
import useAppConfig from "@/features/app/hooks/useAppConfig";
import useAppVersionCheck from "@/features/app/hooks/useAppVersionCheck";
import usePushNotifications from "@/features/notifications/hooks/usePushNotifications";
import { SUPPORTED_LANGUAGES } from "@/services/i18n";
import Colors from "@/ui/theme/colors";

const SettingsScreen = () => {
  const { signOut } = useAuth();
  const { t, i18n } = useTranslation();
  const router = useRouter();
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

  const handleSignOut = () => {
    storage.delete(STORAGE_KEYS.devAuthBypass);
    return signOut();
  };

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
    ? t("settings.checking")
    : versionError
      ? t("settings.updateUnavailable")
      : requiresUpdate
        ? t("settings.updateRequired")
        : needsUpdate
          ? t("settings.updateAvailable")
          : t("settings.upToDate");
  const configKeys = Object.keys(config ?? {}).length;
  const configLabel = configLoading
    ? t("settings.refreshing")
    : configError
      ? t("settings.refreshFailed")
      : t("settings.configKeys", { count: configKeys });
  const notificationsLabel = !deviceSupported
    ? t("settings.notificationsDeviceRequired")
    : pushStatus === "granted"
      ? t("settings.notificationsEnabled")
      : pushStatus === "denied"
        ? t("settings.notificationsOff")
        : t("settings.notificationsNotEnabled");
  const notificationsAction =
    pushStatus === "granted"
      ? t("settings.notificationsManage")
      : t("settings.notificationsEnable");
  const handleNotificationsPress = () => {
    if (!deviceSupported || pushLoading) return;
    if (pushStatus === "granted") {
      openPushSettings();
      return;
    }
    void enablePush();
  };

  const currentLanguageLabel =
    SUPPORTED_LANGUAGES.find((language) => language.code === i18n.language)?.label ??
    SUPPORTED_LANGUAGES[0]?.label ??
    i18n.language;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("settings.account")}</Text>
        <TouchableOpacity style={styles.row} onPress={handleSignOut}>
          <Text style={styles.rowText}>{t("settings.logout")}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("settings.notifications")}</Text>
        <TouchableOpacity style={styles.row} onPress={handleNotificationsPress}>
          <View style={styles.rowContent}>
            <Text style={styles.rowText}>{t("settings.pushNotifications")}</Text>
            <Text style={styles.rowSubText}>{notificationsLabel}</Text>
          </View>
          <Text style={styles.rowActionText}>{notificationsAction}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("settings.app")}</Text>
        <TouchableOpacity style={styles.row} onPress={handleAboutPress}>
          <Text style={styles.rowText}>
            {t("settings.aboutApp", { appName: t("brand.appName") })}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={handleVersionPress}>
          <View style={styles.rowContent}>
            <Text style={styles.rowText}>
              {t("settings.versionLabel", { version: currentVersion })}
            </Text>
            <Text style={styles.rowSubText}>{updateLabel}</Text>
          </View>
          <Text style={styles.rowActionText}>
            {needsUpdate || requiresUpdate ? t("settings.update") : t("settings.check")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={handleConfigPress}>
          <View style={styles.rowContent}>
            <Text style={styles.rowText}>{t("settings.remoteConfig")}</Text>
            <Text style={styles.rowSubText}>{configLabel}</Text>
          </View>
          <Text style={styles.rowActionText}>{t("settings.refresh")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => router.push("/(app)/language")}>
          <View style={styles.rowContent}>
            <Text style={styles.rowText}>{t("settings.language")}</Text>
            <Text style={styles.rowSubText}>{currentLanguageLabel}</Text>
          </View>
          <Text style={styles.rowActionText}>{t("settings.change")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>{t("settings.terms")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>{t("settings.privacy")}</Text>
        </TouchableOpacity>
      </View>

      {showTesting && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.testing")}</Text>
          <View style={styles.row}>
            <Text style={styles.rowText}>{t("settings.testProMode")}</Text>
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
