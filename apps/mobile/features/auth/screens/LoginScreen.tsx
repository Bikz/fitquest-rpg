import Colors from "@/ui/theme/colors";
import { defaultStyles } from "@/ui/theme/styles";
import { useSignIn, useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
  View,
  useWindowDimensions,
} from "react-native";

type ClerkError = {
  errors?: { message?: string; code?: string }[];
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

const LoginScreen = () => {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const verticalOffset = Math.round(height * 0.12);
  const { signIn, setActive, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setActiveSignUp, isLoaded: signUpLoaded } = useSignUp();

  const [emailAddress, setEmailAddress] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [flow, setFlow] = useState<"signIn" | "signUp" | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSeed, setResendSeed] = useState(0);
  const emailValue = emailAddress.trim();
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
  const showEmailError = emailValue.length > 0 && !isEmailValid;
  const resendDisabled = resendCooldown > 0 || loading;
  const resendLabel =
    resendCooldown > 0
      ? `Resend in ${String(Math.floor(resendCooldown / 60)).padStart(2, "0")}:${String(
          resendCooldown % 60,
        ).padStart(2, "0")}`
      : "Resend code";

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
  }, [pendingVerification, resendSeed]);

  const startEmailFlow = async () => {
    if (!signInLoaded || !signUpLoaded) {
      return;
    }
    const email = emailAddress.trim();
    if (!email) {
      Alert.alert("Enter your email", "Please add an email address to continue.");
      return;
    }
    if (!isEmailValid) {
      Alert.alert("Invalid email", "Enter a valid email address to continue.");
      return;
    }
    setLoading(true);
    try {
      await signIn.create({ identifier: email });
      await signIn.prepareFirstFactor({ strategy: "email_code" });
      setFlow("signIn");
      setPendingVerification(true);
    } catch (err) {
      const { message, code: errorCode } = getClerkError(err);
      const isNotFound =
        errorCode === "form_identifier_not_found" ||
        message?.toLowerCase().includes("not found");
      if (!isNotFound) {
        Alert.alert("Sign in failed", message ?? "Try again.");
        setLoading(false);
        return;
      }
      try {
        await signUp.create({ emailAddress: email });
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setFlow("signUp");
        setPendingVerification(true);
      } catch (signUpErr) {
        const { message: signUpMessage } = getClerkError(signUpErr);
        Alert.alert("Sign up failed", signUpMessage ?? "Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!pendingVerification || !flow) {
      return;
    }
    const value = code.trim();
    if (!value) {
      Alert.alert("Enter the code", "Check your email for the verification code.");
      return;
    }
    setLoading(true);
    try {
      if (flow === "signIn") {
        const attempt = await signIn.attemptFirstFactor({
          strategy: "email_code",
          code: value,
        });
        if (attempt.status === "complete") {
          await setActive({ session: attempt.createdSessionId });
          router.replace("/(app)/(tabs)/home");
          return;
        }
      } else {
        const attempt = await signUp.attemptEmailAddressVerification({ code: value });
        if (attempt.status === "complete") {
          await setActiveSignUp({ session: attempt.createdSessionId });
          router.replace("/(app)/(tabs)/home");
          return;
        }
      }
      Alert.alert("Verification incomplete", "Try again or request a new code.");
    } catch (err) {
      const { message } = getClerkError(err);
      Alert.alert("Verification failed", message ?? "Try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setPendingVerification(false);
    setFlow(null);
    setCode("");
    setResendCooldown(0);
  };

  const resendCode = async () => {
    if (!pendingVerification || !flow) {
      return;
    }
    if (flow === "signIn" && !signInLoaded) {
      return;
    }
    if (flow === "signUp" && !signUpLoaded) {
      return;
    }
    setLoading(true);
    try {
      if (flow === "signIn") {
        await signIn.prepareFirstFactor({ strategy: "email_code" });
      } else {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      }
      setResendSeed((value) => value + 1);
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
          {pendingVerification ? "Check your email" : "Continue with email"}
        </Text>
        <View style={styles.card}>
          <View style={styles.form}>
            {pendingVerification ? (
              <>
                <Text style={styles.subtitle}>
                  Enter the 6-digit code we sent to {emailAddress}.
                </Text>
                <TextInput
                  keyboardType="number-pad"
                  placeholder="123456"
                  value={code}
                  onChangeText={setCode}
                  style={styles.inputField}
                />
                <View style={styles.resendRow}>
                  <Text style={styles.resendHint}>Didn’t get a code?</Text>
                  <TouchableOpacity disabled={resendDisabled} onPress={resendCode}>
                    <Text
                      style={[styles.resendButtonText, resendDisabled && styles.resendButtonDisabled]}
                    >
                      {resendLabel}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="you@example.com"
                value={emailAddress}
                onChangeText={setEmailAddress}
                style={[styles.inputField, showEmailError && styles.inputFieldError]}
              />
            )}
            {!pendingVerification && showEmailError && (
              <Text style={styles.errorText}>Enter a valid email address.</Text>
            )}
          </View>
          {pendingVerification ? (
            <>
              <TouchableOpacity style={[defaultStyles.btn, styles.btnPrimary]} onPress={verifyCode}>
                <Text style={styles.btnPrimaryText}>Verify code</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[defaultStyles.btn, styles.btnSecondary]}
                onPress={resetFlow}
              >
                <Text style={styles.btnSecondaryText}>Use a different email</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[
                defaultStyles.btn,
                styles.btnPrimary,
                !isEmailValid && styles.btnPrimaryDisabled,
              ]}
              onPress={startEmailFlow}
              disabled={!isEmailValid}
            >
              <Text style={styles.btnPrimaryText}>Continue</Text>
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
});

export default LoginScreen;
