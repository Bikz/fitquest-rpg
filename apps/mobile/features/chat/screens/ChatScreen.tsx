import ChatMessage from "@/features/chat/components/ChatMessage";
import MessageIdeas from "@/features/chat/components/MessageIdeas";
import MessageInput from "@/features/chat/components/MessageInput";
import { addChat, addMessage, getMessages } from "@/features/chat/data/chatDatabase";
import { type Message, Role } from "@/features/chat/models/messages";
import { sendChat } from "@/services/ai/client";
import { defaultStyles } from "@/ui/theme/styles";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { FlashList } from "@shopify/flash-list";
import { Drawer } from "expo-router/drawer";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { Image, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";

const ChatScreen: React.FC<{ id: string }> = ({ id }) => {
  const [height, setHeight] = useState(0);
  const [working, setWorking] = useState(false);
  const db = useSQLiteContext();
  const [chatId, setChatId] = useState(id);
  const [messages, setMessages] = useState<Message[]>([]);
  const { getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    setChatId(id);
  }, [id]);

  useEffect(() => {
    if (!id) {
      setMessages([]);
      return;
    }
    getMessages(db, Number.parseInt(id, 10)).then((res) => {
      setMessages(res);
    });
  }, [db, id]);

  const onLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setHeight(height);
  };

  const ensureChatId = async (title: string) => {
    if (chatId) return Number.parseInt(chatId, 10);
    const result = await addChat(db, title);
    const createdId = result.lastInsertRowId;
    setChatId(createdId.toString());
    return createdId;
  };

  const getCompletions = async (message: string) => {
    const newChatId = await ensureChatId(message);
    const userMessage: Message = { content: message, role: Role.User };
    await addMessage(db, newChatId, userMessage);
    setMessages((prev) => [...prev, userMessage]);

    setWorking(true);
    try {
      const token = await getToken();
      const aiResponse = await sendChat(
        [...messages, userMessage].map((item) => ({
          role: item.role === Role.Bot ? "assistant" : "user",
          content: item.content,
        })),
        {
          token,
          userId: user?.id,
          authProvider: user?.externalAccounts?.[0]?.provider ?? null,
        },
      );
      const botMessage: Message = {
        content: aiResponse.content,
        role: Role.Bot,
      };
      await addMessage(db, newChatId, botMessage);
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const botMessage: Message = {
        content: "Something went wrong. Try again in a moment.",
        role: Role.Bot,
      };
      await addMessage(db, newChatId, botMessage);
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setWorking(false);
    }
  };

  return (
    <View style={defaultStyles.pageContainer}>
      <Drawer.Screen
        options={{
          headerTitle: "Chat",
        }}
      />
      <View style={styles.page} onLayout={onLayout}>
        {messages.length === 0 && (
          <View style={[styles.logoContainer, { marginTop: height / 2 - 15 }]}>
            <Image source={require("@/assets/images/logo-white.png")} style={styles.image} />
          </View>
        )}
        <FlashList
          data={messages}
          renderItem={({ item }) => <ChatMessage {...item} />}
          estimatedItemSize={400}
          contentContainerStyle={{ paddingTop: 30, paddingBottom: 150 }}
          keyboardDismissMode="interactive"
          ListFooterComponent={working ? <ChatMessage role={Role.Bot} content="" loading /> : null}
        />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "android" ? "height" : "padding"}
        keyboardVerticalOffset={60}
      >
        <MessageIdeas onSelectMessage={getCompletions} />
        <MessageInput onShouldSendMessage={getCompletions} />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 50,
    backgroundColor: "#000",
    borderRadius: 50,
  },
  image: {
    width: 30,
    height: 30,
    resizeMode: "cover",
  },
  page: {
    flex: 1,
  },
});

export default ChatScreen;
