import { Redis } from "@upstash/redis";
export declare const connectRedis: () => Redis;
export declare const getRedisClient: () => Redis;
export declare const pingRedis: () => Promise<string>;
export declare const setRedisData: (key: string, value: string, expirationInSeconds?: number) => Promise<void>;
export declare const getRedisData: (key: string) => Promise<string | null>;
export declare const deleteRedisData: (key: string) => Promise<void>;
export declare const hset: (key: string, field: string, value: string | number) => Promise<number>;
export declare const hget: (key: string, field: string) => Promise<string | null>;
export declare const hgetall: (key: string) => Promise<Record<string, string> | null>;
export declare const hmget: (key: string, fields: string[]) => Promise<Record<string, unknown> | null>;
export declare const hincrbyfloat: (key: string, field: string, increment: number) => Promise<number>;
export declare const hincrby: (key: string, field: string, increment: number) => Promise<number>;
export declare const expireKey: (key: string, seconds: number) => Promise<number>;
export declare const existsKey: (key: string) => Promise<number>;
export declare const getKeys: (pattern: string) => Promise<string[]>;
//# sourceMappingURL=redis.d.ts.map