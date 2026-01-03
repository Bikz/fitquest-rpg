import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FEATURES } from "@/config/features";
import { useEntitlements } from "@/features/billing/hooks/useEntitlements";
import GlassSurface from "@/ui/components/GlassSurface";
import Colors from "@/ui/theme/colors";
import { defaultStyles } from "@/ui/theme/styles";

const HomeScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useUser();
  const { isPro } = useEntitlements();
  const displayName = user?.firstName || user?.fullName || "there";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("home.title")}</Text>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push("/(app)/(tabs)/profile")}
        >
          <Ionicons name="person-circle-outline" size={32} color={Colors.dark} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeTitle}>{t("home.greeting", { name: displayName })}</Text>
        <Text style={styles.welcomeSubtitle}>{t("home.subtitle")}</Text>

        <GlassSurface style={styles.card} glassEffectStyle="regular">
          <Text style={styles.cardTitle}>{t("home.plan")}</Text>
          <Text style={styles.cardValue}>{isPro ? t("home.pro") : t("home.free")}</Text>
          {!isPro && (
            <TouchableOpacity
              style={[defaultStyles.btn, styles.upgradeButton]}
              onPress={() => router.push("/(app)/upgrade")}
            >
              <Text style={styles.upgradeButtonText}>{t("home.upgrade")}</Text>
            </TouchableOpacity>
          )}
        </GlassSurface>

        {FEATURES.chat && (
          <TouchableOpacity
            style={[defaultStyles.btn, styles.primaryButton]}
            onPress={() => router.push("/(chat)/(drawer)/chat/new")}
          >
            <Text style={styles.primaryButtonText}>{t("home.openChat")}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.dark,
  },
  profileButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    gap: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.dark,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.grey,
  },
  card: {
    backgroundColor: Colors.input,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    textTransform: "uppercase",
    color: Colors.grey,
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark,
  },
  upgradeButton: {
    backgroundColor: Colors.primary,
    marginTop: 8,
  },
  upgradeButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: Colors.dark,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default HomeScreen;
