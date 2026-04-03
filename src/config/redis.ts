import { Redis } from "@upstash/redis";
import { config } from "./index";

let redisClient: Redis | null = null;

export const connectRedis = (): Redis => {
  try {
    console.log("🔄 Initializing Redis (Upstash REST)...");

    redisClient = new Redis({
      url: config.redis.url,
      token: config.redis.token,
    });

    console.log("✅ Redis Client Initialized (Upstash REST)");

    return redisClient;
  } catch (error) {
    console.error("❌ Redis Initialization Failed");
    if (error instanceof Error) {
      console.error(error.message);
    }
    throw error;
  }
};

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    // Auto-initialize jika belum ada (untuk serverless)
    return connectRedis();
  }
  return redisClient;
};

// Test connection
export const pingRedis = async (): Promise<string> => {
  try {
    const client = getRedisClient();
    const result = await client.ping();
    console.log("🏓 Redis PING:", result);
    return result as string;
  } catch (error) {
    console.error(
      "❌ Redis PING failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    throw error;
  }
};

// Helper function to set data with expiration
export const setRedisData = async (
  key: string,
  value: string,
  expirationInSeconds?: number,
): Promise<void> => {
  try {
    const client = getRedisClient();
    if (expirationInSeconds) {
      await client.setex(key, expirationInSeconds, value);
    } else {
      await client.set(key, value);
    }
  } catch (error) {
    console.error(
      "❌ Redis SET failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    throw error;
  }
};

// Helper function to get data
export const getRedisData = async (key: string): Promise<string | null> => {
  try {
    const client = getRedisClient();
    return await client.get(key);
  } catch (error) {
    console.error(
      "❌ Redis GET failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    throw error;
  }
};

// Helper function to delete data
export const deleteRedisData = async (key: string): Promise<void> => {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (error) {
    console.error(
      "❌ Redis DELETE failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    throw error;
  }
};

// ==========================================
// HASH OPERATIONS (untuk monitoring IoT)
// ==========================================

// HSET - Set field dalam hash
export const hset = async (
  key: string,
  field: string,
  value: string | number,
): Promise<number> => {
  try {
    const client = getRedisClient();
    return await client.hset(key, { [field]: value });
  } catch (error) {
    console.error(
      "❌ Redis HSET failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    throw error;
  }
};

// HGET - Get single field dari hash
export const hget = async (
  key: string,
  field: string,
): Promise<string | null> => {
  try {
    const client = getRedisClient();
    return await client.hget(key, field);
  } catch (error) {
    console.error(
      "❌ Redis HGET failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    throw error;
  }
};

// HGETALL - Get semua field dari hash
export const hgetall = async (
  key: string,
): Promise<Record<string, string> | null> => {
  try {
    const client = getRedisClient();
    return await client.hgetall(key);
  } catch (error) {
    console.error(
      "❌ Redis HGETALL failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    throw error;
  }
};

// HMGET - Get multiple fields dari hash
export const hmget = async (
  key: string,
  fields: string[],
): Promise<Record<string, unknown> | null> => {
  try {
    const client = getRedisClient();
    return await client.hmget(key, ...fields);
  } catch (error) {
    console.error(
      "❌ Redis HMGET failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    throw error;
  }
};

// HINCRBYFLOAT - Increment float value dalam hash field
export const hincrbyfloat = async (
  key: string,
  field: string,
  increment: number,
): Promise<number> => {
  try {
    const client = getRedisClient();
    return await client.hincrbyfloat(key, field, increment);
  } catch (error) {
    console.error(
      "❌ Redis HINCRBYFLOAT failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    throw error;
  }
};

// HINCRBY - Increment integer value dalam hash field
export const hincrby = async (
  key: string,
  field: string,
  increment: number,
): Promise<number> => {
  try {
    const client = getRedisClient();
    return await client.hincrby(key, field, increment);
  } catch (error) {
    console.error(
      "❌ Redis HINCRBY failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    throw error;
  }
};

// EXPIRE - Set expiration pada key
export const expireKey = async (
  key: string,
  seconds: number,
): Promise<number> => {
  try {
    const client = getRedisClient();
    return await client.expire(key, seconds);
  } catch (error) {
    console.error(
      "❌ Redis EXPIRE failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    throw error;
  }
};

// EXISTS - Check if key exists
export const existsKey = async (key: string): Promise<number> => {
  try {
    const client = getRedisClient();
    return await client.exists(key);
  } catch (error) {
    console.error(
      "❌ Redis EXISTS failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    throw error;
  }
};

// KEYS - Get keys matching pattern (gunakan dengan hati-hati di production)
export const getKeys = async (pattern: string): Promise<string[]> => {
  try {
    const client = getRedisClient();
    return await client.keys(pattern);
  } catch (error) {
    console.error(
      "❌ Redis KEYS failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    throw error;
  }
};
