import { migrateDbIfNeeded } from "@/data/storage/database";
import useEnsureUserProfile from "@/features/auth/hooks/useEnsureUserProfile";
import Colors from "@/ui/theme/colors";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";

const AppStack = () => {
  useEnsureUserProfile();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.light },
        headerShadowVisible: false,
        headerTitleStyle: { color: Colors.dark },
        contentStyle: { backgroundColor: Colors.light },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
      <Stack.Screen name="upgrade" options={{ title: "Upgrade" }} />
      <Stack.Screen name="delete-account" options={{ title: "Delete account" }} />
    </Stack>
  );
};

const AppLayout = () => {
  return (
    <SQLiteProvider databaseName="app.db" onInit={migrateDbIfNeeded}>
      <AppStack />
    </SQLiteProvider>
  );
};

export default AppLayout;
