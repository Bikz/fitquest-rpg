import { env } from "@/config/env";

export const FEATURES = {
  chat: env.featureChat,
  devAuthBypass: __DEV__ && env.featureDevAuthBypass,
};
