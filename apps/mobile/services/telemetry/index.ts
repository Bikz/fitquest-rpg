export type TelemetryEvent = {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
};

export type TelemetryClient = {
  trackEvent: (event: TelemetryEvent) => Promise<void>;
  captureError: (error: Error, context?: Record<string, unknown>) => Promise<void>;
  setUser?: (userId?: string | null) => void;
};

const noopClient: TelemetryClient = {
  trackEvent: async () => undefined,
  captureError: async () => undefined,
};

let client: TelemetryClient = noopClient;

export const configureTelemetry = (next: TelemetryClient) => {
  client = next;
};

export const trackEvent = async (event: TelemetryEvent) => {
  return client.trackEvent(event);
};

export const captureError = async (error: Error, context?: Record<string, unknown>) => {
  return client.captureError(error, context);
};

export const setUserContext = (userId?: string | null) => {
  client.setUser?.(userId);
};
