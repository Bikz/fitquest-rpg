import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { Platform, StyleSheet, View, type ViewProps } from "react-native";

type GlassSurfaceProps = ViewProps & {
  glassEffectStyle?: "clear" | "regular";
  tintColor?: string;
  isInteractive?: boolean;
};

const GlassSurface = ({
  children,
  style,
  glassEffectStyle = "regular",
  tintColor,
  isInteractive = false,
  ...rest
}: GlassSurfaceProps) => {
  const canUseGlass = Platform.OS === "ios" && isLiquidGlassAvailable();

  if (!canUseGlass) {
    return (
      <View style={style} {...rest}>
        {children}
      </View>
    );
  }

  return (
    <GlassView
      style={[styles.glass, style]}
      glassEffectStyle={glassEffectStyle}
      tintColor={tintColor}
      isInteractive={isInteractive}
      {...rest}
    >
      {children}
    </GlassView>
  );
};

const styles = StyleSheet.create({
  glass: {
    overflow: "hidden",
  },
});

export default GlassSurface;
