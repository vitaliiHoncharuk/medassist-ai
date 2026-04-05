import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitResult = {
  success: boolean;
  remaining: number;
};

let ratelimit: Ratelimit | null = null;

const getRatelimit = (): Ratelimit | null => {
  if (ratelimit) return ratelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(5, "60 s"),
    analytics: false,
  });

  return ratelimit;
};

export const checkRateLimit = async (
  identifier: string
): Promise<RateLimitResult> => {
  const limiter = getRatelimit();

  // Gracefully degrade if Upstash is not configured (dev mode)
  if (!limiter) {
    return { success: true, remaining: -1 };
  }

  const result = await limiter.limit(identifier);
  return {
    success: result.success,
    remaining: result.remaining,
  };
};
