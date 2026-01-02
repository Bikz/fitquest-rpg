import { useSignIn, useSignUp } from "@clerk/clerk-expo";
import { useState } from "react";
import { Alert } from "react-native";

interface AuthParams {
  emailAddress: string;
  password: string;
}

const useAuthActions = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded, setActive: signupSetActive } = useSignUp();

  const [loading, setLoading] = useState(false);

  const handleSignInPress: (authData: AuthParams) => void = async (authData) => {
    if (!isLoaded) {
      return;
    }
    const { emailAddress, password } = authData;
    setLoading(true);
    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // This indicates the user is signed in
      await setActive({ session: completeSignIn.createdSessionId });
    } catch (err) {
      const message =
        typeof err === "object" && err && "errors" in err
          ? (err as { errors?: { message?: string }[] }).errors?.[0]?.message
          : err instanceof Error
            ? err.message
            : undefined;
      Alert.alert("Sign in failed", message ?? "Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpPress: (authData: AuthParams) => void = async (authData) => {
    if (!signUpLoaded) {
      return;
    }
    const { emailAddress, password } = authData;
    setLoading(true);
    try {
      // Create the user on Clerk
      const result = await signUp.create({
        emailAddress,
        password,
      });
      // This indicates the user is signed in
      signupSetActive({ session: result.createdSessionId });
    } catch (err) {
      const message =
        typeof err === "object" && err && "errors" in err
          ? (err as { errors?: { message?: string }[] }).errors?.[0]?.message
          : err instanceof Error
            ? err.message
            : undefined;
      Alert.alert("Sign up failed", message ?? "Try again.");
    } finally {
      setLoading(false);
    }
  };
  return { loading, handleSignInPress, handleSignUpPress };
};

export default useAuthActions;
