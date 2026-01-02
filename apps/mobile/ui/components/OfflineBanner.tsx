import { StyleSheet, Text, View } from "react-native";
import { useNetworkStatus } from "@/ui/hooks/useNetworkStatus";
import Colors from "@/ui/theme/colors";

const OfflineBanner = () => {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const offline = !isConnected || !isInternetReachable;

  if (!offline) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>You're offline. Some features may be unavailable.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: Colors.dark,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  text: {
    color: "#fff",
    textAlign: "center",
    fontSize: 12,
  },
});

export default OfflineBanner;
