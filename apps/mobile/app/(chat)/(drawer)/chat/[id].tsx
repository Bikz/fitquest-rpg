import ChatScreen from "@/features/chat/screens/ChatScreen";
import { useLocalSearchParams } from "expo-router";

const Chat = () => {
  const { id } = useLocalSearchParams();
  return <ChatScreen id={id as string} />;
};

export default Chat;
