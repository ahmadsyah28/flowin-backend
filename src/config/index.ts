import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Validate required environment variables
 * Exits process if any required variable is missing
 */
function validateEnvVars(): void {
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
    console.error(
      "\n💡 Please check your .env file and ensure all required variables are set.",
    );
    console.error("   Copy .env.example to .env and fill in the values.\n");
    process.exit(1);
  }

  // Validate JWT_SECRET length in production
  if (process.env.NODE_ENV === "production") {
    const jwtSecret = process.env.JWT_SECRET || "";
    if (jwtSecret.length < 32) {
      console.error(
        "❌ JWT_SECRET must be at least 32 characters in production!",
      );
      console.error(
        "   Generate strong secret using: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"\n",
      );
      process.exit(1);
    }
  }
}

// Run validation
validateEnvVars();

/**
 * Centralized configuration object
 * All environment variables should be accessed through this object
 */
export const config = {
  // Server
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: (process.env.NODE_ENV || "development") as
    | "development"
    | "production"
    | "test",

  // Database
  mongoUri: process.env.MONGODB_URI!,

  // Redis
  redis: {
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    // Future: tambahkan refresh token config
    // refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!,
    // refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },

  // Google OAuth (optional)
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  },

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || "*",

  // GraphQL
  graphqlPath: process.env.GRAPHQL_PATH || "/graphql",

  // Midtrans
  midtrans: {
    serverKey: process.env.MIDTRANS_SERVER_KEY || "",
    clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    snapUrl:
      process.env.MIDTRANS_SNAP_URL ||
      "https://app.sandbox.midtrans.com/snap/snap.js",
    apiUrl: process.env.MIDTRANS_API_URL || "https://api.sandbox.midtrans.com",
    callbackUrl: process.env.MIDTRANS_CALLBACK_URL || "flowin://payment",
  },

  // Pagination defaults
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },
};

// Type export for config
export type Config = typeof config;

// Helper to check if running in production
export const isProduction = config.nodeEnv === "production";
export const isDevelopment = config.nodeEnv === "development";
