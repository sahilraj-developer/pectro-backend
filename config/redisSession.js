// redisSession.js
import session from "express-session";
import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

// ------------------
// Redis Client
// ------------------
export const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
  },
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on("connect", () => console.log("✅ Connected to Redis"));
redisClient.on("error", (err) => console.error("Redis error:", err));

await redisClient.connect();

// ------------------
// Redis Session Store (v7+)
// ------------------
import RedisStorePkg from "connect-redis"; // Use the package directly
const RedisStore = RedisStorePkg; // RedisStore is a class in v7+

export const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient, prefix: "sess:" }),
  secret: process.env.SESSION_SECRET || "defaultSecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 1000 * 60 * 60, // 1 hour
  },
});
