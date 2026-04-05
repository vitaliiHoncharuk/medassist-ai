/**
 * Extract client IP from request headers.
 * Uses a chain: x-real-ip > x-forwarded-for (first IP) > fallback.
 */
export const extractClientIp = (headers: Headers): string => {
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  return "anonymous";
};
