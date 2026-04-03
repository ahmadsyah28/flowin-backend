"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKeys = exports.existsKey = exports.expireKey = exports.hincrby = exports.hincrbyfloat = exports.hmget = exports.hgetall = exports.hget = exports.hset = exports.deleteRedisData = exports.getRedisData = exports.setRedisData = exports.pingRedis = exports.getRedisClient = exports.connectRedis = void 0;
const redis_1 = require("@upstash/redis");
const index_1 = require("./index");
let redisClient = null;
const connectRedis = () => {
    try {
        console.log("🔄 Initializing Redis (Upstash REST)...");
        redisClient = new redis_1.Redis({
            url: index_1.config.redis.url,
            token: index_1.config.redis.token,
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
const hset = async (key, field, value) => {
    try {
        const client = (0, exports.getRedisClient)();
        return await client.hset(key, { [field]: value });
    }
    catch (error) {
        console.error("❌ Redis HSET failed:", error instanceof Error ? error.message : "Unknown error");
        throw error;
    }
};
exports.hset = hset;
const hget = async (key, field) => {
    try {
        const client = (0, exports.getRedisClient)();
        return await client.hget(key, field);
    }
    catch (error) {
        console.error("❌ Redis HGET failed:", error instanceof Error ? error.message : "Unknown error");
        throw error;
    }
};
exports.hget = hget;
const hgetall = async (key) => {
    try {
        const client = (0, exports.getRedisClient)();
        return await client.hgetall(key);
    }
    catch (error) {
        console.error("❌ Redis HGETALL failed:", error instanceof Error ? error.message : "Unknown error");
        throw error;
    }
};
exports.hgetall = hgetall;
const hmget = async (key, fields) => {
    try {
        const client = (0, exports.getRedisClient)();
        return await client.hmget(key, ...fields);
    }
    catch (error) {
        console.error("❌ Redis HMGET failed:", error instanceof Error ? error.message : "Unknown error");
        throw error;
    }
};
exports.hmget = hmget;
const hincrbyfloat = async (key, field, increment) => {
    try {
        const client = (0, exports.getRedisClient)();
        return await client.hincrbyfloat(key, field, increment);
    }
    catch (error) {
        console.error("❌ Redis HINCRBYFLOAT failed:", error instanceof Error ? error.message : "Unknown error");
        throw error;
    }
};
exports.hincrbyfloat = hincrbyfloat;
const hincrby = async (key, field, increment) => {
    try {
        const client = (0, exports.getRedisClient)();
        return await client.hincrby(key, field, increment);
    }
    catch (error) {
        console.error("❌ Redis HINCRBY failed:", error instanceof Error ? error.message : "Unknown error");
        throw error;
    }
};
exports.hincrby = hincrby;
const expireKey = async (key, seconds) => {
    try {
        const client = (0, exports.getRedisClient)();
        return await client.expire(key, seconds);
    }
    catch (error) {
        console.error("❌ Redis EXPIRE failed:", error instanceof Error ? error.message : "Unknown error");
        throw error;
    }
};
exports.expireKey = expireKey;
const existsKey = async (key) => {
    try {
        const client = (0, exports.getRedisClient)();
        return await client.exists(key);
    }
    catch (error) {
        console.error("❌ Redis EXISTS failed:", error instanceof Error ? error.message : "Unknown error");
        throw error;
    }
};
exports.existsKey = existsKey;
const getKeys = async (pattern) => {
    try {
        const client = (0, exports.getRedisClient)();
        return await client.keys(pattern);
    }
    catch (error) {
        console.error("❌ Redis KEYS failed:", error instanceof Error ? error.message : "Unknown error");
        throw error;
    }
};
exports.getKeys = getKeys;
//# sourceMappingURL=redis.js.map