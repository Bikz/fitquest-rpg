import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Icon, Label, NativeTabs, VectorIcon } from "expo-router/unstable-native-tabs";
import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { DynamicColorIOS, Platform } from "react-native";
import type { SFSymbol } from "sf-symbols-typescript";
import Colors from "@/ui/theme/colors";

const iosTint =
  Platform.OS === "ios"
    ? DynamicColorIOS({
        dark: "#ffffff",
        light: Colors.dark,
      })
    : Colors.dark;

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

const tabIcon = (sfDefault: SFSymbol, sfSelected: SFSymbol, androidName: MaterialIconName) => {
  if (Platform.OS === "ios") {
    return <Icon sf={{ default: sfDefault, selected: sfSelected }} />;
  }

  return <Icon src={<VectorIcon family={MaterialIcons} name={androidName} />} />;
};

const TabsLayout = () => {
  const { t } = useTranslation();
  return (
    <NativeTabs
      tintColor={Platform.OS === "ios" ? iosTint : Colors.dark}
      labelStyle={Platform.OS === "ios" ? { color: iosTint } : undefined}
    >
      <NativeTabs.Trigger name="home">
        <Label>{t("tabs.home")}</Label>
        {tabIcon("house", "house.fill", "home")}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Label>{t("tabs.profile")}</Label>
        {tabIcon("person", "person.fill", "person")}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
};

export default TabsLayout;
