import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useEntitlements } from "@/features/billing/hooks/useEntitlements";
import { openManageSubscriptions } from "@/services/billing/revenuecat";
import GlassSurface from "@/ui/components/GlassSurface";
import Colors from "@/ui/theme/colors";
import { defaultStyles } from "@/ui/theme/styles";

const ProfileScreen = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { isPro } = useEntitlements();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.name}>{user?.fullName || user?.firstName || "App User"}</Text>
      <Text style={styles.email}>{user?.primaryEmailAddress?.emailAddress}</Text>

      <GlassSurface style={styles.planBadge} glassEffectStyle="regular">
        <Text style={styles.planBadgeText}>{isPro ? "Pro" : "Free"}</Text>
      </GlassSurface>

      {!isPro && (
        <TouchableOpacity
          style={[defaultStyles.btn, styles.primaryButton]}
          onPress={() => router.push("/(app)/upgrade")}
        >
          <Text style={styles.primaryButtonText}>Upgrade to Pro</Text>
        </TouchableOpacity>
      )}

      {isPro && (
        <TouchableOpacity
          style={[defaultStyles.btn, styles.primaryButton]}
          onPress={() => void openManageSubscriptions()}
        >
          <Text style={styles.primaryButtonText}>Manage subscription</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[defaultStyles.btn, styles.secondaryButton]}
        onPress={() => router.push("/(app)/settings")}
      >
        <Text style={styles.secondaryButtonText}>Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[defaultStyles.btn, styles.logoutButton]} onPress={() => signOut()}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[defaultStyles.btn, styles.deleteButton]}
        onPress={() => router.push("/(app)/delete-account")}
      >
        <Text style={styles.deleteButtonText}>Delete account</Text>
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
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.dark,
  },
  email: {
    marginTop: 4,
    color: Colors.grey,
  },
  planBadge: {
    marginTop: 16,
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.input,
  },
  planBadgeText: {
    fontSize: 12,
    color: Colors.grey,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    marginTop: 32,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: Colors.dark,
    marginTop: 12,
  },
  secondaryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: Colors.greyLight,
    marginTop: 12,
  },
  logoutButtonText: {
    color: Colors.dark,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: Colors.orange,
    marginTop: 12,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default ProfileScreen;
