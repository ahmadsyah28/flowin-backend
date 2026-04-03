"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRedisData = exports.getRedisData = exports.setRedisData = exports.pingRedis = exports.getRedisClient = exports.connectRedis = void 0;
const redis_1 = require("@upstash/redis");
let redisClient = null;
const connectRedis = () => {
    try {
        const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
        const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
        if (!redisUrl || !redisToken) {
            throw new Error("UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not defined");
        }
        console.log("🔄 Initializing Redis (Upstash REST)...");
        redisClient = new redis_1.Redis({
            url: redisUrl,
            token: redisToken,
        });
        console.log("✅ Redis Client Initialized (Upstash REST)");
        return redisClient;
    }
    catch (error) {
        console.error("❌ Redis Initialization Failed");
        if (error instanceof Error) {
            console.error(error.message);
        }
        throw error;
    }
};
exports.connectRedis = connectRedis;
const getRedisClient = () => {
    if (!redisClient) {
        return (0, exports.connectRedis)();
    }
    return redisClient;
};
exports.getRedisClient = getRedisClient;
const pingRedis = async () => {
    try {
        const client = (0, exports.getRedisClient)();
        const result = await client.ping();
        console.log("🏓 Redis PING:", result);
        return result;
    }
    catch (error) {
        console.error("❌ Redis PING failed:", error instanceof Error ? error.message : "Unknown error");
        throw error;
    }
};
exports.pingRedis = pingRedis;
const setRedisData = async (key, value, expirationInSeconds) => {
    try {
        const client = (0, exports.getRedisClient)();
        if (expirationInSeconds) {
            await client.setex(key, expirationInSeconds, value);
        }
        else {
            await client.set(key, value);
        }
    }
    catch (error) {
        console.error("❌ Redis SET failed:", error instanceof Error ? error.message : "Unknown error");
        throw error;
    }
};
exports.setRedisData = setRedisData;
const getRedisData = async (key) => {
    try {
        const client = (0, exports.getRedisClient)();
        return await client.get(key);
    }
    catch (error) {
        console.error("❌ Redis GET failed:", error instanceof Error ? error.message : "Unknown error");
        throw error;
    }
};
exports.getRedisData = getRedisData;
const deleteRedisData = async (key) => {
    try {
        const client = (0, exports.getRedisClient)();
        await client.del(key);
    }
    catch (error) {
        console.error("❌ Redis DELETE failed:", error instanceof Error ? error.message : "Unknown error");
        throw error;
    }
};
exports.deleteRedisData = deleteRedisData;
//# sourceMappingURL=redis.js.map