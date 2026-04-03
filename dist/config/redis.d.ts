import { Redis } from "@upstash/redis";
export declare const connectRedis: () => Redis;
export declare const getRedisClient: () => Redis;
export declare const pingRedis: () => Promise<string>;
export declare const setRedisData: (key: string, value: string, expirationInSeconds?: number) => Promise<void>;
export declare const getRedisData: (key: string) => Promise<string | null>;
export declare const deleteRedisData: (key: string) => Promise<void>;
//# sourceMappingURL=redis.d.ts.map