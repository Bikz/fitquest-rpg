import { useApiRequest } from "@/services/api/client";
import { deleteUserAccount } from "@/services/api/user";
import Colors from "@/ui/theme/colors";
import { defaultStyles } from "@/ui/theme/styles";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const DeleteAccountScreen = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const { request } = useApiRequest();
  const router = useRouter();
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmation.trim().toLowerCase() === "delete";

  const handleDelete = async () => {
    if (!canDelete || loading) return;
    setLoading(true);
    setError(null);

    try {
      await deleteUserAccount(request);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to delete your account.";
      setError(message);
      setLoading(false);
      return;
    }

    try {
      if (user?.delete) {
        await user.delete();
      }
    } catch {
      // Continue to sign out even if the provider delete fails.
    }

    try {
      await signOut();
    } finally {
      router.replace("/");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delete account</Text>
      <Text style={styles.body}>
        This permanently deletes your data and cannot be undone. Type DELETE to confirm.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Type DELETE to confirm"
        placeholderTextColor={Colors.grey}
        value={confirmation}
        onChangeText={setConfirmation}
        autoCapitalize="characters"
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={[defaultStyles.btn, styles.deleteButton, !canDelete && styles.disabledButton]}
        disabled={!canDelete || loading}
        onPress={handleDelete}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.deleteButtonText}>Delete account</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[defaultStyles.btn, styles.cancelButton]}
        onPress={() => router.back()}
        disabled={loading}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
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
  body: {
    fontSize: 15,
    color: Colors.grey,
    marginBottom: 20,
  },
  input: {
    backgroundColor: Colors.input,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.dark,
  },
  error: {
    color: Colors.pink,
    marginTop: 12,
  },
  deleteButton: {
    backgroundColor: Colors.pink,
    marginTop: 24,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButton: {
    backgroundColor: Colors.greyLight,
    marginTop: 12,
  },
  cancelButtonText: {
    color: Colors.dark,
    fontWeight: "600",
  },
});

export default DeleteAccountScreen;
