export interface EnvironmentVariables {
    MONGODB_URI: string;
    PORT: string;
    NODE_ENV: "development" | "production" | "test";
    JWT_ACCESS_SECRET: string;
    JWT_EXPIRES_IN: string;
    UPSTASH_REDIS_REST_URL: string;
    UPSTASH_REDIS_REST_TOKEN: string;
}
declare global {
    namespace NodeJS {
        interface ProcessEnv extends EnvironmentVariables {
        }
    }
}
//# sourceMappingURL=env.d.ts.map