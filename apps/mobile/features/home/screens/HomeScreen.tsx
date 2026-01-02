import { FEATURES } from "@/config/features";
import { useEntitlements } from "@/features/billing/hooks/useEntitlements";
import GlassSurface from "@/ui/components/GlassSurface";
import Colors from "@/ui/theme/colors";
import { defaultStyles } from "@/ui/theme/styles";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const HomeScreen = () => {
  const router = useRouter();
  const { user } = useUser();
  const { isPro } = useEntitlements();
  const displayName = user?.firstName || user?.fullName || "there";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AppBase</Text>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push("/(app)/(tabs)/profile")}
        >
          <Ionicons name="person-circle-outline" size={32} color={Colors.dark} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeTitle}>Hi {displayName}.</Text>
        <Text style={styles.welcomeSubtitle}>Your base template is ready to customize.</Text>

        <GlassSurface style={styles.card} glassEffectStyle="regular">
          <Text style={styles.cardTitle}>Plan</Text>
          <Text style={styles.cardValue}>{isPro ? "Pro" : "Free"}</Text>
          {!isPro && (
            <TouchableOpacity
              style={[defaultStyles.btn, styles.upgradeButton]}
              onPress={() => router.push("/(app)/upgrade")}
            >
              <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
            </TouchableOpacity>
          )}
        </GlassSurface>

        {FEATURES.chat && (
          <TouchableOpacity
            style={[defaultStyles.btn, styles.primaryButton]}
            onPress={() => router.push("/(chat)/(drawer)/chat/new")}
          >
            <Text style={styles.primaryButtonText}>Open Chat</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
    paddingHorizontal: 24,
    paddingTop: 20,
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
