import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { useTranslation } from "react-i18next";
import { migrateDbIfNeeded } from "@/data/storage/database";
import useEnsureUserProfile from "@/features/auth/hooks/useEnsureUserProfile";
import Colors from "@/ui/theme/colors";

const AppStack = () => {
  const { t } = useTranslation();
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
      <Stack.Screen name="settings" options={{ title: t("screens.settings") }} />
      <Stack.Screen name="language" options={{ title: t("language.title") }} />
      <Stack.Screen name="upgrade" options={{ title: t("screens.upgrade") }} />
      <Stack.Screen name="delete-account" options={{ title: t("deleteAccount.title") }} />
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
