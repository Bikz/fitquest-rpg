import Colors from "@/ui/theme/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Icon, Label, NativeTabs, VectorIcon } from "expo-router/unstable-native-tabs";
import { DynamicColorIOS, Platform } from "react-native";

const iosTint =
  Platform.OS === "ios"
    ? DynamicColorIOS({
        dark: "#ffffff",
        light: Colors.dark,
      })
    : Colors.dark;

const tabIcon = (sfDefault: string, sfSelected: string, androidName: string) => {
  if (Platform.OS === "ios") {
    return <Icon sf={{ default: sfDefault, selected: sfSelected }} />;
  }

  return <Icon src={<VectorIcon family={MaterialIcons} name={androidName} />} />;
};

const TabsLayout = () => {
  return (
    <NativeTabs
      tintColor={Platform.OS === "ios" ? iosTint : Colors.dark}
      labelStyle={Platform.OS === "ios" ? { color: iosTint } : undefined}
    >
      <NativeTabs.Trigger name="home">
        <Label>Home</Label>
        {tabIcon("house", "house.fill", "home")}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Label>Profile</Label>
        {tabIcon("person", "person.fill", "person")}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
};

export default TabsLayout;
