export declare const config: {
    port: number;
    nodeEnv: "development" | "production" | "test";
    mongoUri: string;
    redis: {
        url: string;
        token: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    google: {
        clientId: string;
        clientSecret: string;
    };
    corsOrigin: string;
    graphqlPath: string;
    midtrans: {
        serverKey: string;
        clientKey: string;
        isProduction: boolean;
        snapUrl: string;
        apiUrl: string;
        callbackUrl: string;
    };
    pagination: {
        defaultPageSize: number;
        maxPageSize: number;
    };
};
export type Config = typeof config;
export declare const isProduction: boolean;
export declare const isDevelopment: boolean;
//# sourceMappingURL=index.d.ts.map