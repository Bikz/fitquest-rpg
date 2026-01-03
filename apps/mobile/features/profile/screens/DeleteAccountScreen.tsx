import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useApiRequest } from "@/services/api/client";
import { deleteUserAccount } from "@/services/api/user";
import Colors from "@/ui/theme/colors";
import { defaultStyles } from "@/ui/theme/styles";

type DeleteFormValues = {
  confirmation: string;
};

const DeleteAccountScreen = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const { request } = useApiRequest();
  const router = useRouter();
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<DeleteFormValues>({
    defaultValues: { confirmation: "" },
    mode: "onChange",
  });
  const confirmation = useWatch({ control, name: "confirmation" }) ?? "";
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const canDelete = confirmation.trim().toLowerCase() === "delete" && isValid;

  const handleDelete = async () => {
    if (loading) return;
    setLoading(true);
    setRequestError(null);

    try {
      await deleteUserAccount(request);
    } catch (err) {
      const message = err instanceof Error ? err.message : t("deleteAccount.requestFailed");
      setRequestError(message);
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
      <Text style={styles.title}>{t("deleteAccount.title")}</Text>
      <Text style={styles.body}>{t("deleteAccount.body")}</Text>

      <Controller
        control={control}
        name="confirmation"
        rules={{
          required: t("deleteAccount.confirmValidation"),
          validate: (value) =>
            value.trim().toLowerCase() === "delete" || t("deleteAccount.confirmValidation"),
        }}
        render={({ field: { value, onChange } }) => (
          <TextInput
            style={[styles.input, errors.confirmation && styles.inputError]}
            placeholder={t("deleteAccount.placeholder")}
            placeholderTextColor={Colors.grey}
            value={value}
            onChangeText={onChange}
            autoCapitalize="characters"
          />
        )}
      />

      {errors.confirmation && <Text style={styles.error}>{errors.confirmation.message}</Text>}
      {requestError && <Text style={styles.error}>{requestError}</Text>}

      <TouchableOpacity
        style={[defaultStyles.btn, styles.deleteButton, !canDelete && styles.disabledButton]}
        disabled={!canDelete || loading}
        onPress={handleSubmit(handleDelete)}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.deleteButtonText}>{t("deleteAccount.deleteButton")}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[defaultStyles.btn, styles.cancelButton]}
        onPress={() => router.back()}
        disabled={loading}
      >
        <Text style={styles.cancelButtonText}>{t("deleteAccount.cancel")}</Text>
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
  inputError: {
    borderWidth: 1,
    borderColor: Colors.pink,
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
