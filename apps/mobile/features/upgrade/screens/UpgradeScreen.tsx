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
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const UpgradeScreen = () => {
  const router = useRouter();
  const { isPro } = useEntitlements();
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
      const message = error instanceof Error ? error.message : "Please try again shortly.";
      Alert.alert("Upgrade failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Let your app grow</Text>
      <Text style={styles.subtitle}>Unlock all pro features for your users.</Text>

      <View style={styles.list}>
        <Text style={styles.listItem}>Unlimited features</Text>
        <Text style={styles.listItem}>Premium content</Text>
        <Text style={styles.listItem}>Priority support</Text>
      </View>

      <Text style={styles.price}>$2.99/month billed annually</Text>
      <Text style={styles.trial}>1 week free trial</Text>

      <TouchableOpacity
        style={[defaultStyles.btn, styles.primaryButton]}
        onPress={handleUpgrade}
        disabled={isPro || loading}
      >
        <Text style={styles.primaryButtonText}>
          {isPro ? "You're Pro" : loading ? "Processing..." : "Start free trial"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.secondaryAction}>Not now</Text>
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
