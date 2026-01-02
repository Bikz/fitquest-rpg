import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

const useSplashScreen = () => {
  const [loaded, fontLoadingError] = useFonts({
    SpaceMono: require("../../../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const appResourcesReady = loaded;
  useEffect(() => {
    if (fontLoadingError) throw fontLoadingError;
  }, [fontLoadingError]);
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);
  return { appResourcesReady };
};

export default useSplashScreen;
