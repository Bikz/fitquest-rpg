import { Linking, Platform } from "react-native";
import Purchases, { type CustomerInfo } from "react-native-purchases";
import { BILLING } from "@/config/billing";
import { env } from "@/config/env";

const getApiKey = () => {
  if (Platform.OS === "ios") return env.revenueCat.iosApiKey;
  if (Platform.OS === "android") return env.revenueCat.androidApiKey;
  return "";
};

export const isRevenueCatConfigured = () => Boolean(getApiKey());

export const configureRevenueCat = async (userId?: string) => {
  if (Platform.OS === "web") return false;
  const apiKey = getApiKey();
  if (!apiKey) return false;
  Purchases.configure({ apiKey, appUserID: userId });
  return true;
};

export const getIsProFromCustomerInfo = (info: CustomerInfo) => {
  return Boolean(info.entitlements.active[BILLING.proEntitlementId]);
};

export const addCustomerInfoListener = (listener: (info: CustomerInfo) => void) => {
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => Purchases.removeCustomerInfoUpdateListener(listener);
};

export const syncCustomerInfo = async () => {
  return Purchases.getCustomerInfo();
};

export const purchasePro = async () => {
  const offerings = await Purchases.getOfferings();
  const current = offerings.current;
  if (!current || current.availablePackages.length === 0) {
    throw new Error("No purchase packages available.");
  }
  return Purchases.purchasePackage(current.availablePackages[0]);
};

export const openManageSubscriptions = async () => {
  const purchasesAny = Purchases as typeof Purchases & {
    showManageSubscriptions?: () => Promise<void>;
  };

  if (purchasesAny.showManageSubscriptions) {
    await purchasesAny.showManageSubscriptions();
    return;
  }

  if (Platform.OS === "ios") {
    await Linking.openURL("https://apps.apple.com/account/subscriptions");
    return;
  }

  if (Platform.OS === "android") {
    await Linking.openURL("https://play.google.com/store/account/subscriptions");
  }
};
