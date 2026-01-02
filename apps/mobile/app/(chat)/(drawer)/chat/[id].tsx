import { useLocalSearchParams } from "expo-router";
import ChatScreen from "@/features/chat/screens/ChatScreen";

const Chat = () => {
  const { id } = useLocalSearchParams();
  return <ChatScreen id={id as string} />;
};

export default Chat;
