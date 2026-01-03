import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AnimatedIntro from "@/features/auth/components/AnimatedIntro";
import BottomLoginSheet from "@/features/auth/components/BottomLoginSheet";
import Colors from "@/ui/theme/colors";

const WelcomeScreen = () => {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <AnimatedIntro />
      <BottomLoginSheet />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
    paddingTop: 12,
  },
});

export default WelcomeScreen;
