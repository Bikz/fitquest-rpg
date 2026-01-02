import { useOAuthSignIn } from "@/features/auth/hooks/useOAuthSignIn";
import Colors from "@/ui/theme/colors";
import { defaultStyles } from "@/ui/theme/styles";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BottomLoginSheet = () => {
  const { bottom } = useSafeAreaInsets();
  const { signInWithApple, signInWithGoogle } = useOAuthSignIn();
  return (
    <View style={[styles.container, { paddingBottom: bottom + 30 }]}>
      <TouchableOpacity style={[defaultStyles.btn, styles.lightBtn]} onPress={signInWithApple}>
        <Ionicons name="logo-apple" size={14} style={styles.iconBtn} />
        <Text style={styles.btnLightText}>Continue with Apple</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[defaultStyles.btn, styles.darkBtn]} onPress={signInWithGoogle}>
        <Ionicons name="logo-google" size={14} style={styles.iconBtn} color={"#FFF"} />
        <Text style={styles.btnDarkText}>Continue with Google</Text>
      </TouchableOpacity>
      <Link
        href="/(auth)/sign-up"
        asChild
        style={[defaultStyles.btn, styles.darkBtn, { alignItems: "center" }]}
      >
        <TouchableOpacity>
          <Ionicons name="mail" size={14} style={styles.iconBtn} color={"#FFF"} />
          <Text style={styles.btnDarkText}>Continue with email</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: Colors.dark,
    padding: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 15,
  },
  lightBtn: {
    backgroundColor: "#FFF",
  },
  darkBtn: {
    backgroundColor: Colors.grey,
  },
  iconBtn: {
    paddingRight: 7,
  },
  btnLightText: {
    fontSize: 20,
  },
  btnDarkText: {
    fontSize: 20,
    color: "#FFF",
  },
  btnOutline: {
    borderWidth: 3,
    borderColor: Colors.grey,
  },
});

export default BottomLoginSheet;
