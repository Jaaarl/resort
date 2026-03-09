import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 login attempts per 15 minutes
  message: {
    status: "error",
    message: "Too many login attempts, please try again after 15 minutes",
  },
});

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per 15 minutes
  message: {
    status: "error",
    message: "Too many requests, please try again after 15 minutes",
  },
});
