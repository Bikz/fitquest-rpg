import { useUser } from "@clerk/clerk-expo";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect } from "react";
import { upsertUserProfile } from "@/data/storage/database";
import { useApiRequest } from "@/services/api/client";
import { upsertUserProfile as upsertRemoteProfile } from "@/services/api/user";

const FALLBACK_DISPLAY_NAME = "App User";

const useEnsureUserProfile = () => {
  const { user, isLoaded } = useUser();
  const db = useSQLiteContext();
  const { request } = useApiRequest();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const displayName = user.fullName || user.firstName || user.username || FALLBACK_DISPLAY_NAME;

    void upsertUserProfile(db, {
      id: user.id,
      displayName,
      createdAt: Date.now(),
    });

    void upsertRemoteProfile(request, {
      displayName,
      authProvider: user.externalAccounts?.[0]?.provider ?? null,
    }).catch(() => undefined);
  }, [db, isLoaded, request, user]);
};

export default useEnsureUserProfile;
