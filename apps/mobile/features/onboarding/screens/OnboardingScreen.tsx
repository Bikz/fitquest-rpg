import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  Animated,
  Platform,
  type ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { STORAGE_KEYS } from "@/data/storage/keys";
import { storage } from "@/data/storage/kv";
import Colors from "@/ui/theme/colors";
import { defaultStyles } from "@/ui/theme/styles";

const PAGES = [
  {
    title: "Welcome to your next app.",
    description: "A clean starter with auth, onboarding, and billing ready.",
  },
  {
    title: "Build fast.",
    description: "Features and services are organized for scale.",
  },
  {
    title: "Ship confidently.",
    description: "AI hooks and entitlements are wired for quick iteration.",
  },
];

const OnboardingScreen = () => {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const lastIndexRef = useRef(0);
  const [index, setIndex] = useState(0);

  const triggerHaptic = () => {
    if (Platform.OS === "web" || typeof Haptics.selectionAsync !== "function") {
      return;
    }
    Haptics.selectionAsync().catch(() => {});
  };

  const pageStyles = useMemo(
    () =>
      PAGES.map((_, pageIndex) => {
        const inputRange = [(pageIndex - 1) * width, pageIndex * width, (pageIndex + 1) * width];
        return {
          opacity: scrollX.interpolate({
            inputRange,
            outputRange: [0, 1, 0],
            extrapolate: "clamp",
          }),
          transform: [
            {
              translateY: scrollX.interpolate({
                inputRange,
                outputRange: [12, 0, 12],
                extrapolate: "clamp",
              }),
            },
          ],
        };
      }),
    [scrollX, width],
  );

  const handleContinue = () => {
    const nextIndex = index + 1;
    if (nextIndex < PAGES.length) {
      triggerHaptic();
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
      setIndex(nextIndex);
      return;
    }
    storage.set(STORAGE_KEYS.onboardingComplete, true);
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: true,
        })}
        onMomentumScrollEnd={(event) => {
          const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          if (nextIndex !== lastIndexRef.current) {
            triggerHaptic();
            lastIndexRef.current = nextIndex;
          }
          setIndex(nextIndex);
        }}
      >
        {PAGES.map((item, pageIndex) => (
          <View key={item.title} style={[styles.page, { width }]}>
            <Animated.View style={[styles.pageContent, pageStyles[pageIndex]]}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </Animated.View>
          </View>
        ))}
      </Animated.ScrollView>
      <View style={styles.footer}>
        <View style={styles.dots}>
          {PAGES.map((page, i) => (
            <View
              key={page.title}
              style={[styles.dot, i === index ? styles.dotActive : undefined]}
            />
          ))}
        </View>
        <TouchableOpacity
          style={[defaultStyles.btn, styles.primaryButton]}
          onPress={handleContinue}
        >
          <Text style={styles.primaryButtonText}>
            {index === PAGES.length - 1 ? "Get started" : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  page: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  pageContent: {
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: Colors.dark,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: Colors.grey,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.greyLight,
  },
  dotActive: {
    backgroundColor: Colors.primary,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default OnboardingScreen;
