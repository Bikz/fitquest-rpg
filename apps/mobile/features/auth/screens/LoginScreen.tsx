import { useSignIn, useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { FEATURES } from "@/config/features";
import { STORAGE_KEYS } from "@/data/storage/keys";
import { storage } from "@/data/storage/kv";
import Colors from "@/ui/theme/colors";
import { defaultStyles } from "@/ui/theme/styles";

type ClerkError = {
  errors?: { message?: string; code?: string }[];
};

type LoginFormValues = {
  email: string;
  code: string;
};

const fieldLabelMap: Record<string, string> = {
  first_name: "first name",
  last_name: "last name",
  password: "password",
  legal_accepted: "terms acceptance",
  email_address: "email",
  phone_number: "phone number",
  username: "username",
  web3_wallet: "web3 wallet",
  email_address_or_phone_number: "email or phone",
};

const getClerkError = (err: unknown) => {
  if (typeof err === "object" && err && "errors" in err) {
    const errors = (err as ClerkError).errors;
    if (errors?.length) {
      return { message: errors[0].message, code: errors[0].code };
    }
  }
  if (err instanceof Error) {
    return { message: err.message };
  }
  return {};
};

const formatFieldList = (fields: string[]) => {
  const normalized = Array.from(
    new Set(fields.map((field) => fieldLabelMap[field] ?? field)),
  ).filter(Boolean);
  if (normalized.length === 0) {
    return "";
  }
  if (normalized.length === 1) {
    return normalized[0];
  }
  if (normalized.length === 2) {
    return `${normalized[0]} and ${normalized[1]}`;
  }
  return `${normalized.slice(0, -1).join(", ")}, and ${normalized[normalized.length - 1]}`;
};

const LoginScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const verticalOffset = Math.round(height * 0.12);
  const { signIn, setActive, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setActiveSignUp, isLoaded: signUpLoaded } = useSignUp();
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormValues>({
    defaultValues: { email: "", code: "" },
    mode: "onChange",
  });

  const [pendingVerification, setPendingVerification] = useState(false);
  const [flow, setFlow] = useState<"signIn" | "signUp" | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [signInEmailAddressId, setSignInEmailAddressId] = useState<string | null>(null);
  const emailInput = useWatch({ control, name: "email" }) ?? "";
  const codeInput = useWatch({ control, name: "code" }) ?? "";
  const emailValue = emailInput.trim();
  const codeValue = codeInput.trim();
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
  const isCodeValid = /^\d{6}$/.test(codeValue);
  const emailError = errors.email?.message;
  const codeError = errors.code?.message;
  const resendDisabled = resendCooldown > 0 || loading;
  const resendLabel =
    resendCooldown > 0
      ? t("auth.resendIn", {
          time: `${String(Math.floor(resendCooldown / 60)).padStart(2, "0")}:${String(
            resendCooldown % 60,
          ).padStart(2, "0")}`,
        })
      : t("auth.resendCode");

  const handleDevBypass = () => {
    if (!FEATURES.devAuthBypass) return;
    storage.set(STORAGE_KEYS.devAuthBypass, true);
    storage.set(STORAGE_KEYS.onboardingComplete, true);
    router.replace("/(app)/(tabs)/home");
  };

  useEffect(() => {
    if (!pendingVerification) {
      setResendCooldown(0);
      return;
    }
    const interval = setInterval(() => {
      setResendCooldown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    setResendCooldown(45);
    return () => clearInterval(interval);
  }, [pendingVerification]);

  const startEmailFlow = async ({ email }: LoginFormValues) => {
    if (!signInLoaded || !signUpLoaded || !signIn || !signUp) {
      return;
    }
    setSignInEmailAddressId(null);
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      Alert.alert(t("auth.enterEmailTitle"), t("auth.enterEmailBody"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      Alert.alert(t("auth.invalidEmailTitle"), t("auth.invalidEmailBody"));
      return;
    }
    setLoading(true);
    try {
      await signIn.create({ identifier: normalizedEmail });
      const emailFactor = signIn.supportedFirstFactors?.find(
        (factor) => factor.strategy === "email_code",
      );
      const emailAddressId =
        emailFactor && "emailAddressId" in emailFactor ? emailFactor.emailAddressId : null;
      if (!emailAddressId) {
        Alert.alert(t("auth.emailCodeUnavailableTitle"), t("auth.emailCodeUnavailableBody"));
        setLoading(false);
        return;
      }
      await signIn.prepareFirstFactor({ strategy: "email_code", emailAddressId });
      setSignInEmailAddressId(emailAddressId);
      setFlow("signIn");
      setPendingVerification(true);
      setValue("code", "");
    } catch (err) {
      const { message, code: errorCode } = getClerkError(err);
      const isNotFound =
        errorCode === "form_identifier_not_found" || message?.toLowerCase().includes("not found");
      if (!isNotFound) {
        Alert.alert(t("auth.signInFailedTitle"), message ?? t("auth.tryAgain"));
        setLoading(false);
        return;
      }
      try {
        const result = await signUp.create({ emailAddress: normalizedEmail });
        const blockingFields = result.requiredFields?.filter((field) => field !== "email_address");
        if (blockingFields?.length) {
          const missing = formatFieldList(blockingFields);
          Alert.alert(
            t("auth.signUpNeedsInfoTitle"),
            missing
              ? t("auth.signUpNeedsInfoBody", { fields: missing })
              : t("auth.signUpNeedsInfoBodyGeneric"),
          );
          setLoading(false);
          return;
        }
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setFlow("signUp");
        setPendingVerification(true);
        setSignInEmailAddressId(null);
        setValue("code", "");
      } catch (signUpErr) {
        const { message: signUpMessage } = getClerkError(signUpErr);
        Alert.alert(t("auth.signUpFailedTitle"), signUpMessage ?? t("auth.tryAgain"));
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!pendingVerification || !flow) {
      return;
    }
    const value = codeValue;
    if (!value) {
      Alert.alert(t("auth.enterCodeTitle"), t("auth.enterCodeBody"));
      return;
    }
    setLoading(true);
    try {
      if (flow === "signIn") {
        if (!signInLoaded || !signIn || !setActive) {
          return;
        }
        const attempt = await signIn.attemptFirstFactor({
          strategy: "email_code",
          code: value,
        });
        if (attempt.status === "complete" && attempt.createdSessionId) {
          await setActive({ session: attempt.createdSessionId });
          router.replace("/(app)/(tabs)/home");
          return;
        }
        if (attempt.status === "needs_second_factor") {
          Alert.alert(t("auth.secondFactorTitle"), t("auth.secondFactorBody"));
          return;
        }
        if (attempt.status === "needs_new_password") {
          Alert.alert(t("auth.passwordResetTitle"), t("auth.passwordResetBody"));
          return;
        }
      } else {
        if (!signUpLoaded || !signUp || !setActiveSignUp) {
          return;
        }
        const attempt = await signUp.attemptEmailAddressVerification({ code: value });
        if (attempt.status === "complete" && attempt.createdSessionId) {
          await setActiveSignUp({ session: attempt.createdSessionId });
          router.replace("/(app)/(tabs)/home");
          return;
        }
        if (attempt.status === "missing_requirements") {
          const missing = formatFieldList(attempt.missingFields ?? []);
          Alert.alert(
            t("auth.signUpNeedsInfoTitle"),
            missing
              ? t("auth.signUpNeedsInfoBody", { fields: missing })
              : t("auth.signUpNeedsInfoBodyGeneric"),
          );
          return;
        }
      }
      Alert.alert(t("auth.verificationIncompleteTitle"), t("auth.verificationIncompleteBody"));
    } catch (err) {
      const { message } = getClerkError(err);
      if (message?.toLowerCase().includes("already verified")) {
        Alert.alert(t("auth.codeAlreadyUsedTitle"), t("auth.codeAlreadyUsedBody"));
      } else {
        Alert.alert(t("auth.verificationFailedTitle"), message ?? t("auth.tryAgain"));
      }
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setPendingVerification(false);
    setFlow(null);
    setValue("code", "");
    setResendCooldown(0);
    setSignInEmailAddressId(null);
  };

  const resendCode = async () => {
    if (!pendingVerification || !flow) {
      return;
    }
    setLoading(true);
    try {
      if (flow === "signIn") {
        if (!signInLoaded || !signIn) {
          return;
        }
        if (!signInEmailAddressId) {
          Alert.alert("Missing email setup", "Restart the sign-in flow to request a new code.");
          return;
        }
        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: signInEmailAddressId,
        });
      } else {
        if (!signUpLoaded || !signUp) {
          return;
        }
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      }
      setResendCooldown(45);
    } catch (err) {
      const { message } = getClerkError(err);
      Alert.alert("Resend failed", message ?? "Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      keyboardVerticalOffset={1}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {loading && (
        <View style={defaultStyles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFF" />
        </View>
      )}
      <View style={[styles.content, { marginTop: -verticalOffset }]}>
        <Image source={require("../../../assets/images/logo-dark.png")} style={styles.logo} />
        <Text style={styles.title}>
          {pendingVerification ? t("auth.checkEmailTitle") : t("auth.continueWithEmailTitle")}
        </Text>
        <View style={styles.card}>
          <View style={styles.form}>
            {pendingVerification ? (
              <>
                <Text style={styles.subtitle}>
                  {t("auth.emailCodeHint", { email: emailValue })}
                </Text>
                <Controller
                  control={control}
                  name="code"
                  rules={{
                    validate: (value) => {
                      if (!pendingVerification) return true;
                      if (!value?.trim()) return t("auth.enterCodeValidation");
                      if (!/^\d{6}$/.test(value.trim())) return t("auth.enterCodeValidation");
                      return true;
                    },
                  }}
                  render={({ field: { value, onChange } }) => (
                    <TextInput
                      keyboardType="number-pad"
                      placeholder={t("auth.codePlaceholder")}
                      value={value}
                      onChangeText={onChange}
                      style={[styles.inputField, codeError && styles.inputFieldError]}
                    />
                  )}
                />
                {!!codeError && <Text style={styles.errorText}>{codeError}</Text>}
                <View style={styles.resendRow}>
                  <Text style={styles.resendHint}>{t("auth.didntGetCode")}</Text>
                  <TouchableOpacity disabled={resendDisabled} onPress={resendCode}>
                    <Text
                      style={[
                        styles.resendButtonText,
                        resendDisabled && styles.resendButtonDisabled,
                      ]}
                    >
                      {resendLabel}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Controller
                control={control}
                name="email"
                rules={{
                  required: "Enter your email address.",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address.",
                  },
                }}
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    placeholder={t("auth.emailPlaceholder")}
                    value={value}
                    onChangeText={onChange}
                    style={[styles.inputField, emailError && styles.inputFieldError]}
                  />
                )}
              />
            )}
            {!pendingVerification && !!emailError && (
              <Text style={styles.errorText}>{emailError}</Text>
            )}
          </View>
          {pendingVerification ? (
            <>
              <TouchableOpacity
                style={[
                  defaultStyles.btn,
                  styles.btnPrimary,
                  !isCodeValid && styles.btnPrimaryDisabled,
                ]}
                onPress={handleSubmit(verifyCode)}
                disabled={!isCodeValid || loading}
              >
                <Text style={styles.btnPrimaryText}>{t("auth.verifyCode")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[defaultStyles.btn, styles.btnSecondary]}
                onPress={resetFlow}
              >
                <Text style={styles.btnSecondaryText}>{t("auth.useDifferentEmail")}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[
                defaultStyles.btn,
                styles.btnPrimary,
                !isEmailValid && styles.btnPrimaryDisabled,
              ]}
              onPress={handleSubmit(startEmailFlow)}
              disabled={!isEmailValid || loading}
            >
              <Text style={styles.btnPrimaryText}>{t("common.continue")}</Text>
            </TouchableOpacity>
          )}
          {FEATURES.devAuthBypass && (
            <TouchableOpacity style={styles.devBypassButton} onPress={handleDevBypass}>
              <Text style={styles.devBypassText}>{t("auth.devBypass")}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: "center",
    backgroundColor: Colors.light,
  },
  content: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    alignItems: "center",
  },
  logo: {
    width: 60,
    height: 60,
    alignSelf: "center",
  },
  title: {
    fontSize: 30,
    marginVertical: 16,
    fontWeight: "bold",
    alignSelf: "center",
    color: Colors.dark,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  form: {
    width: "100%",
    marginBottom: 16,
  },
  subtitle: {
    textAlign: "center",
    color: Colors.grey,
    marginBottom: 12,
  },
  inputField: {
    width: "100%",
    marginVertical: 6,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.greyLight,
    borderRadius: 12,
    padding: 10,
    backgroundColor: "#fff",
  },
  inputFieldError: {
    borderColor: Colors.pink,
  },
  errorText: {
    color: Colors.orange,
    marginTop: 8,
    textAlign: "center",
  },
  resendRow: {
    marginTop: 8,
    alignItems: "center",
    gap: 6,
  },
  resendHint: {
    color: Colors.grey,
    textAlign: "center",
  },
  resendButtonText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  resendButtonDisabled: {
    color: Colors.greyLight,
  },
  btnPrimary: {
    backgroundColor: Colors.primary,
    marginVertical: 4,
    width: "100%",
  },
  btnPrimaryDisabled: {
    backgroundColor: Colors.greyLight,
  },
  btnPrimaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  btnSecondary: {
    backgroundColor: Colors.input,
    marginVertical: 4,
    width: "100%",
  },
  btnSecondaryText: {
    color: Colors.dark,
    fontSize: 16,
    fontWeight: "600",
  },
  devBypassButton: {
    marginTop: 8,
    alignItems: "center",
  },
  devBypassText: {
    color: Colors.grey,
    fontSize: 12,
  },
});

export default LoginScreen;
