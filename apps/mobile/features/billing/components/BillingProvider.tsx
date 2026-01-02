import { useAuth, useUser } from "@clerk/clerk-expo";
import { type ReactNode, useEffect } from "react";
import { useApiRequest } from "@/services/api/client";
import { fetchEntitlements, syncEntitlements } from "@/services/api/entitlements";
import { setRcIsPro } from "@/services/billing/entitlements";
import {
  addCustomerInfoListener,
  configureRevenueCat,
  getIsProFromCustomerInfo,
  syncCustomerInfo,
} from "@/services/billing/revenuecat";

type BillingProviderProps = {
  children: ReactNode;
};

const BillingProvider = ({ children }: BillingProviderProps) => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { request } = useApiRequest();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const configure = async () => {
      if (!isSignedIn) {
        setRcIsPro(false);
        return;
      }

      try {
        const entitlements = await fetchEntitlements(request);
        setRcIsPro(entitlements.isPro);
      } catch {
        // Keep cached entitlements if the API is unavailable.
      }

      const configured = await configureRevenueCat(user?.id);
      if (!configured) {
        return;
      }

      const info = await syncCustomerInfo();
      const isPro = getIsProFromCustomerInfo(info);
      setRcIsPro(isPro);
      try {
        await syncEntitlements(request, {
          isPro,
          source: "revenuecat",
        });
      } catch {
        // Ignore sync failures; local state still updates UI.
      }
      unsubscribe = addCustomerInfoListener((updatedInfo) => {
        const updatedIsPro = getIsProFromCustomerInfo(updatedInfo);
        setRcIsPro(updatedIsPro);
        void syncEntitlements(request, {
          isPro: updatedIsPro,
          source: "revenuecat",
        }).catch(() => undefined);
      });
    };

    configure();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isSignedIn, request, user?.id]);

  return <>{children}</>;
};

export default BillingProvider;
