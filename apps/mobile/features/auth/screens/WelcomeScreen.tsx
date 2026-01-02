import AnimatedIntro from "@/features/auth/components/AnimatedIntro";
import BottomLoginSheet from "@/features/auth/components/BottomLoginSheet";
import Colors from "@/ui/theme/colors";
import { StyleSheet, View } from "react-native";

const WelcomeScreen = () => {
  return (
    <View style={styles.container}>
      <AnimatedIntro />
      <BottomLoginSheet />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
});

export default WelcomeScreen;
