import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import {
  type DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  useDrawerStatus,
} from "@react-navigation/drawer";
import { DrawerActions } from "@react-navigation/native";
import { Link, useNavigation, useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ContextMenu from "zeego/context-menu";
import { getChats, renameChat } from "@/features/chat/data/chatDatabase";
import type { Chat } from "@/features/chat/models/messages";
import Colors from "@/ui/theme/colors";

const CustomDrawerElement = (props: DrawerContentComponentProps) => {
  const { top, bottom } = useSafeAreaInsets();
  const db = useSQLiteContext();
  const isDrawerOpen = useDrawerStatus() === "open";
  const [history, setHistory] = useState<Chat[]>([]);
  const router = useRouter();

  const loadChats = useCallback(async () => {
    // Load chats from SQLite
    const result = (await getChats(db)) as Chat[];
    setHistory(result);
  }, [db]);

  useEffect(() => {
    if (!isDrawerOpen) {
      return;
    }
    void loadChats();
    Keyboard.dismiss();
  }, [isDrawerOpen, loadChats]);
  const onDeleteChat = (chatId: number) => {
    Alert.alert("Delete Chat", "Are you sure you want to delete this chat?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: async () => {
          // Delete the chat
          await db.runAsync("DELETE FROM chats WHERE id = ?", chatId);
          loadChats();
        },
      },
    ]);
  };

  const onRenameChat = (chatId: number) => {
    Alert.prompt("Rename Chat", "Enter a new name for the chat", async (newName: string) => {
      if (newName) {
        // Rename the chat
        await renameChat(db, chatId, newName);
        loadChats();
      }
    });
  };

  return (
    <View style={{ flex: 1, marginTop: top, marginBottom: bottom }}>
      <View style={styles.header}>
        <View style={[styles.searchSection]}>
          <Ionicons name="search" size={16} color={Colors.grey} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            underlineColorAndroid={"transparent"}
            placeholder="Search chats"
          />
        </View>
      </View>
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
        {history.map((chat) => (
          <ContextMenu.Root key={chat.id}>
            <ContextMenu.Trigger>
              <DrawerItem
                label={chat.title}
                onPress={() => router.push(`/(chat)/(drawer)/chat/${chat.id}`)}
                inactiveTintColor="#000"
              />
            </ContextMenu.Trigger>
            <ContextMenu.Content alignOffset={0} avoidCollisions collisionPadding={0} loop={false}>
              <ContextMenu.Preview>
                {() => (
                  <View
                    style={{
                      padding: 16,
                      height: 200,
                      backgroundColor: "#fff",
                    }}
                  >
                    <Text>{chat.title}</Text>
                  </View>
                )}
              </ContextMenu.Preview>

              <ContextMenu.Item key={"rename"} onSelect={() => onRenameChat(chat.id)}>
                <ContextMenu.ItemTitle>Rename</ContextMenu.ItemTitle>
                <ContextMenu.ItemIcon
                  ios={{
                    name: "pencil",
                    pointSize: 18,
                  }}
                />
              </ContextMenu.Item>
              <ContextMenu.Item key={"delete"} onSelect={() => onDeleteChat(chat.id)} destructive>
                <ContextMenu.ItemTitle>Delete</ContextMenu.ItemTitle>
                <ContextMenu.ItemIcon
                  ios={{
                    name: "trash",
                    pointSize: 18,
                  }}
                />
              </ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu.Root>
        ))}
      </DrawerContentScrollView>
      {/* Footer */}
      <View>
        <Link href="/(app)/(tabs)/profile" asChild push>
          <TouchableOpacity style={styles.footer}>
            <Image
              source={{ uri: "https://galaxies.dev/img/meerkat_2.jpg" }}
              style={styles.avatar}
            />
            <Text style={styles.username}>Profile</Text>
            <Ionicons name="ellipsis-horizontal" size={16} color={Colors.greyLight} />
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

const Layout = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  return (
    <Drawer
      drawerContent={CustomDrawerElement}
      screenOptions={{
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer)}>
            <FontAwesome6
              name="grip-lines"
              color={Colors.grey}
              size={20}
              style={{ marginLeft: 16 }}
            />
          </TouchableOpacity>
        ),
        headerStyle: {
          backgroundColor: Colors.light,
        },
        drawerActiveBackgroundColor: Colors.selected,
        drawerActiveTintColor: "#000",
        drawerInactiveTintColor: "#000",
        overlayColor: "rgba(0,0,0,0.2)",
        drawerItemStyle: {
          borderRadius: 12,
        },
        drawerLabelStyle: {
          marginLeft: -20,
        },
        drawerStyle: {
          width: width * 0.86,
        },
      }}
    >
      <Drawer.Screen
        name="chat/new"
        options={{
          title: "Chat",
          drawerIcon: () => (
            <View style={[styles.item, { backgroundColor: "#000" }]}>
              <Image
                style={styles.image}
                source={require("../../../assets/images/logo-white.png")}
              />
            </View>
          ),
          headerRight: () => (
            <View>
              <Link href="/(chat)/(drawer)/chat/new" push asChild>
                <TouchableOpacity>
                  <Ionicons
                    name="create-outline"
                    size={24}
                    style={{ marginRight: 16 }}
                    color={Colors.grey}
                  />
                </TouchableOpacity>
              </Link>
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="chat/[id]"
        options={{
          drawerItemStyle: {
            display: "none",
          },
          headerRight: () => (
            <Link href={"/(chat)/(drawer)/chat/new"} push asChild>
              <TouchableOpacity>
                <Ionicons
                  name="create-outline"
                  size={24}
                  color={Colors.grey}
                  style={{ marginRight: 16 }}
                />
              </TouchableOpacity>
            </Link>
          ),
        }}
      />
    </Drawer>
  );
};

const styles = StyleSheet.create({
  item: {
    overflow: "hidden",
    borderRadius: 15,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 16,
    height: 16,
    resizeMode: "cover",
  },
  header: {
    backgroundColor: "#FFF",
    padding: 12,
    paddingBottom: 0,
  },
  searchSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.input,
    borderRadius: 6,
  },
  searchInput: {
    flex: 1,
    padding: 8,
    paddingLeft: 0,
  },
  searchIcon: {
    padding: 8,
  },
  footer: {
    paddingHorizontal: 16,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  username: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Layout;
