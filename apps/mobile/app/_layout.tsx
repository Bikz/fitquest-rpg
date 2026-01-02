import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { env } from "@/config/env";
import useSplashScreen from "@/features/app/hooks/useSplashScreen";
import useAuthRouter from "@/features/auth/hooks/useAuthRouter";
import BillingProvider from "@/features/billing/components/BillingProvider";
import useInitTelemetry from "@/services/telemetry/useTelemetry";
import ErrorBoundary from "@/ui/components/ErrorBoundary";
import OfflineBanner from "@/ui/components/OfflineBanner";
import Colors from "@/ui/theme/colors";
import "@/services/notifications/expo";
import QueryProvider from "@/services/query/QueryProvider";

function RootNavigationLayout() {
  const { authDataLoaded } = useAuthRouter();
  if (!authDataLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen
        name="login"
        options={{
          title: "",
          presentation: "modal",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close-outline" size={28} />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
      <Stack.Screen name="(chat)" options={{ headerShown: false }} />
    </Stack>
  );
}

const AppShell = () => {
  useInitTelemetry();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <View style={{ flex: 1 }}>
          <OfflineBanner />
          <BillingProvider>
            <RootNavigationLayout />
          </BillingProvider>
        </View>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
};

const RootLayout = () => {
  useSplashScreen();

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={env.clerkPublishableKey}>
      <ClerkLoaded>
        <QueryProvider>
          <AppShell />
        </QueryProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
};

export default RootLayout;
