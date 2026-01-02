export type RetryOptions = {
  retries: number;
  minDelayMs: number;
  maxDelayMs: number;
  factor: number;
  jitter: number;
  retryOn?: (error: unknown, attempt: number) => boolean;
};

export const DEFAULT_RETRY: RetryOptions = {
  retries: 2,
  minDelayMs: 200,
  maxDelayMs: 2000,
  factor: 2,
  jitter: 0.2,
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getDelay = (attempt: number, options: RetryOptions) => {
  const exp = options.minDelayMs * options.factor ** attempt;
  const capped = Math.min(exp, options.maxDelayMs);
  const jitter = capped * options.jitter * (Math.random() * 2 - 1);
  return Math.max(0, Math.round(capped + jitter));
};

export const withRetry = async <T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= options.retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const shouldRetry = options.retryOn ? options.retryOn(error, attempt) : true;
      if (!shouldRetry || attempt >= options.retries) break;
      await sleep(getDelay(attempt, options));
    }
  }

  throw lastError;
};
