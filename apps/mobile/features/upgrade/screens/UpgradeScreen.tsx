import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { STORAGE_KEYS } from "@/data/storage/keys";
import { storage } from "@/data/storage/kv";
import { useEntitlements } from "@/features/billing/hooks/useEntitlements";
import { setRcIsPro } from "@/services/billing/entitlements";
import {
  getIsProFromCustomerInfo,
  isRevenueCatConfigured,
  purchasePro,
} from "@/services/billing/revenuecat";
import Colors from "@/ui/theme/colors";
import { defaultStyles } from "@/ui/theme/styles";

const UpgradeScreen = () => {
  const router = useRouter();
  const { isPro } = useEntitlements();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (!isRevenueCatConfigured()) {
        storage.set(STORAGE_KEYS.testProEnabled, true);
        router.replace("/(app)/(tabs)/home");
        return;
      }

      const result = await purchasePro();
      setRcIsPro(getIsProFromCustomerInfo(result.customerInfo));
      router.replace("/(app)/(tabs)/home");
    } catch (error) {
      const message = error instanceof Error ? error.message : t("upgrade.failedBody");
      Alert.alert(t("upgrade.failedTitle"), message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("upgrade.title")}</Text>
      <Text style={styles.subtitle}>{t("upgrade.subtitle")}</Text>

      <View style={styles.list}>
        <Text style={styles.listItem}>{t("upgrade.list.unlimited")}</Text>
        <Text style={styles.listItem}>{t("upgrade.list.premium")}</Text>
        <Text style={styles.listItem}>{t("upgrade.list.priority")}</Text>
      </View>

      <Text style={styles.price}>{t("upgrade.price")}</Text>
      <Text style={styles.trial}>{t("upgrade.trial")}</Text>

      <TouchableOpacity
        style={[defaultStyles.btn, styles.primaryButton]}
        onPress={handleUpgrade}
        disabled={isPro || loading}
      >
        <Text style={styles.primaryButtonText}>
          {isPro
            ? t("upgrade.youArePro")
            : loading
              ? t("upgrade.processing")
              : t("upgrade.startTrial")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.secondaryAction}>{t("upgrade.notNow")}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.dark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.grey,
    marginBottom: 24,
  },
  list: {
    gap: 8,
    marginBottom: 24,
  },
  listItem: {
    fontSize: 16,
    color: Colors.dark,
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
    marginBottom: 6,
  },
  trial: {
    fontSize: 14,
    color: Colors.grey,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    marginBottom: 16,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  secondaryAction: {
    textAlign: "center",
    color: Colors.grey,
  },
});

export default UpgradeScreen;
