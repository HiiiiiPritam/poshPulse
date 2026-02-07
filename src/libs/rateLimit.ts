
interface RateLimitContext {
  tokens: number;
  lastRefill: number;
}

const rateLimitMap = new Map<string, RateLimitContext>();

interface RateLimitOptions {
  interval: number; // Window size in milliseconds
  uniqueTokenPerInterval: number; // Max requests per window
}

export function rateLimit(options: RateLimitOptions) {
  const { interval, uniqueTokenPerInterval } = options;

  return {
    check: (limit: number, token: string) => {
      const now = Date.now();
      const context = rateLimitMap.get(token) || { tokens: limit, lastRefill: now };

      const timePassed = now - context.lastRefill;
      if (timePassed > interval) {
        context.tokens = limit;
        context.lastRefill = now;
      }

      if (context.tokens > 0) {
        context.tokens--;
        rateLimitMap.set(token, context);
        return true;
      } else {
        rateLimitMap.set(token, context); // Update lastRefill if needed
        return false;
      }
    },
  };
}
