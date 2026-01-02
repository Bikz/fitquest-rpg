import { Ionicons } from "@expo/vector-icons";
import { Redirect, Stack, useRouter } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { TouchableOpacity } from "react-native-gesture-handler";
import { FEATURES } from "@/config/features";
import { migrateDbIfNeeded } from "@/data/storage/database";
import Colors from "@/ui/theme/colors";

const ChatLayout = () => {
  const router = useRouter();
  if (!FEATURES.chat) {
    return <Redirect href="/(app)/(tabs)/home" />;
  }
  return (
    <SQLiteProvider databaseName="app.db" onInit={migrateDbIfNeeded}>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: Colors.light },
        }}
      >
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(modal)/image/[url]"
          options={{
            headerTitle: "",
            presentation: "fullScreenModal",
            headerBlurEffect: "dark",
            headerStyle: { backgroundColor: "rgba(0,0,0,0.4)" },
            headerTransparent: true,
            headerShadowVisible: false,
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => router.back()}
                style={{ borderRadius: 20, padding: 4 }}
              >
                <Ionicons name="close-outline" size={28} color={"#fff"} />
              </TouchableOpacity>
            ),
          }}
        />
      </Stack>
    </SQLiteProvider>
  );
};

export default ChatLayout;
