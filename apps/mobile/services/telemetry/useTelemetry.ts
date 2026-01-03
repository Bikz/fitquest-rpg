import { useUser } from "@clerk/clerk-expo";
import { useEffect, useRef } from "react";
import { ApiRequestError, useApiRequest } from "@/services/api/client";
import { configureTelemetry, setUserContext } from "./index";
import { captureSentryError, initSentry, setSentryUser } from "./sentry";

const useInitTelemetry = () => {
  const { request } = useApiRequest();
  const { user } = useUser();
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    initSentry();
    configureTelemetry({
      trackEvent: async (event) => {
        const userId = userIdRef.current;
        try {
          await request("/analytics", {
            method: "POST",
            body: {
              events: [
                {
                  ...event,
                  userId,
                  timestamp: event.timestamp ?? Date.now(),
                },
              ],
            },
            retry: true,
          });
        } catch (error) {
          if (error instanceof ApiRequestError && error.status === 401) {
            return;
          }
          console.warn("Telemetry event failed", error);
        }
      },
      captureError: async (error, context) => {
        captureSentryError(error, context);
        const userId = userIdRef.current;
        try {
          await request("/analytics", {
            method: "POST",
            body: {
              events: [
                {
                  name: "error",
                  timestamp: Date.now(),
                  properties: {
                    message: error.message,
                    name: error.name,
                    stack: error.stack,
                    userId,
                    ...context,
                  },
                },
              ],
            },
            retry: true,
          });
        } catch (requestError) {
          if (requestError instanceof ApiRequestError && requestError.status === 401) {
            return;
          }
          console.warn("Telemetry error failed", requestError);
        }
      },
      setUser: (userId) => {
        userIdRef.current = userId ?? null;
        setSentryUser(userId);
      },
    });
  }, [request]);

  useEffect(() => {
    userIdRef.current = user?.id ?? null;
    setUserContext(user?.id ?? null);
  }, [user?.id]);
};

export default useInitTelemetry;
