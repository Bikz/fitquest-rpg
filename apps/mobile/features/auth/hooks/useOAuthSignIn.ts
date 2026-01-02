import { useOAuth } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";
import { Alert } from "react-native";

WebBrowser.maybeCompleteAuthSession();

const useOAuthHandler = (strategy: "oauth_apple" | "oauth_google") => {
  const { startOAuthFlow } = useOAuth({ strategy });

  const start = async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (error) {
      let message: string | undefined;
      if (typeof error === "object" && error && "errors" in error) {
        message = (error as { errors?: { message?: string }[] }).errors?.[0]?.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      Alert.alert("Sign in failed", message ?? "Try again.");
    }
  };

  return { start };
};

export const useOAuthSignIn = () => {
  const apple = useOAuthHandler("oauth_apple");
  const google = useOAuthHandler("oauth_google");

  return {
    signInWithApple: apple.start,
    signInWithGoogle: google.start,
  };
};
