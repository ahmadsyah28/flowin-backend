"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDevelopment = exports.isProduction = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function validateEnvVars() {
    const requiredVars = [
        "MONGODB_URI",
        "JWT_SECRET",
        "UPSTASH_REDIS_REST_URL",
        "UPSTASH_REDIS_REST_TOKEN",
    ];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);
    if (missingVars.length > 0) {
        console.error("❌ Missing required environment variables:");
        missingVars.forEach((varName) => {
            console.error(`   - ${varName}`);
        });
        console.error("\n💡 Please check your .env file and ensure all required variables are set.");
        console.error("   Copy .env.example to .env and fill in the values.\n");
        process.exit(1);
    }
    if (process.env.NODE_ENV === "production") {
        const jwtSecret = process.env.JWT_SECRET || "";
        if (jwtSecret.length < 32) {
            console.error("❌ JWT_SECRET must be at least 32 characters in production!");
            console.error("   Generate strong secret using: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"\n");
            process.exit(1);
        }
    }
}
validateEnvVars();
exports.config = {
    port: parseInt(process.env.PORT || "4000", 10),
    nodeEnv: (process.env.NODE_ENV || "development"),
    mongoUri: process.env.MONGODB_URI,
    redis: {
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    corsOrigin: process.env.CORS_ORIGIN || "*",
    graphqlPath: process.env.GRAPHQL_PATH || "/graphql",
    midtrans: {
        serverKey: process.env.MIDTRANS_SERVER_KEY || "",
        clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
        isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
        snapUrl: process.env.MIDTRANS_SNAP_URL ||
            "https://app.sandbox.midtrans.com/snap/snap.js",
        apiUrl: process.env.MIDTRANS_API_URL || "https://api.sandbox.midtrans.com",
        callbackUrl: process.env.MIDTRANS_CALLBACK_URL || "flowin://payment",
    },
    pagination: {
        defaultPageSize: 10,
        maxPageSize: 100,
    },
};
exports.isProduction = exports.config.nodeEnv === "production";
exports.isDevelopment = exports.config.nodeEnv === "development";
//# sourceMappingURL=index.js.map