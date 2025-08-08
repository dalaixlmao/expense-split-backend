import { Request, Response, NextFunction } from "express";

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Optional custom error message
  statusCode?: number; // Optional custom status code
  keyGenerator?: (req: Request) => string; // Custom key generation function
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

/**
 * Simple in-memory rate limiter middleware
 * For production use, consider using redis-backed solutions
 */
export const createRateLimiter = (options: RateLimitOptions) => {
  const {
    windowMs,
    maxRequests,
    message = "Too many requests, please try again later.",
    statusCode = 429,
    keyGenerator = (req: Request) => req.ip || "unknown"
  } = options;

  const store: RateLimitStore = {};

  // Clean up expired entries periodically
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const key in store) {
      if (store[key].resetTime <= now) {
        delete store[key];
      }
    }
  }, windowMs);

  // Ensure cleanup interval is cleared when the process exits
  if (cleanup.unref) {
    cleanup.unref();
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();

    // Initialize or reset if window expired
    if (!store[key] || store[key].resetTime <= now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    // Increment request count
    store[key].count += 1;

    // Set headers for client tracking
    res.setHeader("X-RateLimit-Limit", maxRequests.toString());
    res.setHeader(
      "X-RateLimit-Remaining",
      Math.max(0, maxRequests - store[key].count).toString()
    );
    res.setHeader("X-RateLimit-Reset", Math.ceil(store[key].resetTime / 1000).toString());

    // Check if over limit
    if (store[key].count > maxRequests) {
      res.status(statusCode).json({
        message,
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
      });
    }

    next();
  };
};

// Export pre-configured middleware instances for common scenarios
export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
});

export const authLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5, // 5 login attempts per hour
  message: "Too many login attempts, please try again later.",
});