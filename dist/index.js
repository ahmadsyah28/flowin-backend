"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("@/types/env");
const standalone_1 = require("@apollo/server/standalone");
const database_1 = require("@/config/database");
const redis_1 = require("@/config/redis");
const graphql_1 = require("@/graphql");
console.log("ENV MONGODB_URI:", process.env.MONGODB_URI ? "✅ Loaded" : "❌ NOT LOADED");
async function startServer() {
    try {
        await (0, database_1.connectDB)();
        (0, redis_1.connectRedis)();
        const server = (0, graphql_1.createApolloServer)();
        const PORT = parseInt(process.env.PORT || "4000", 10);
        const { url } = await (0, standalone_1.startStandaloneServer)(server, {
            listen: { port: PORT },
            context: graphql_1.createContext,
        });
        console.log("=================================");
        console.log("🚀 FLOWIN Backend Running");
        console.log(`📍 GraphQL Endpoint : ${url}`);
        console.log(`🧠 Environment      : ${process.env.NODE_ENV}`);
        console.log("=================================");
    }
    catch (error) {
        console.error("❌ Failed to start server");
        if (error instanceof Error) {
            console.error(error.message);
            console.error(error.stack);
        }
        else {
            console.error("Unknown error occurred");
        }
        await (0, database_1.disconnectDB)();
        process.exit(1);
    }
}
process.on("SIGINT", async () => {
    console.log("\\n🛑 Shutting down server gracefully...");
    try {
        await (0, database_1.disconnectDB)();
        console.log("✅ Server shutdown complete");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Error during shutdown:", error);
        process.exit(1);
    }
});
process.on("SIGTERM", async () => {
    console.log("\\n🛑 Received SIGTERM, shutting down gracefully...");
    try {
        await (0, database_1.disconnectDB)();
        console.log("✅ Server shutdown complete");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Error during shutdown:", error);
        process.exit(1);
    }
});
startServer().catch((error) => {
    console.error("❌ Unhandled error during server startup:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map