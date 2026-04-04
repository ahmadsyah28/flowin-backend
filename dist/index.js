"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const server_1 = require("@apollo/server");
const database_1 = require("./config/database");
const redis_1 = require("./config/redis");
const schema_1 = require("./schema");
const typeDefs_1 = require("./schema/typeDefs");
const resolvers_1 = __importDefault(require("./schema/resolvers"));
const middlewares_1 = require("./middlewares");
const midtransWebhook_1 = __importDefault(require("./webhooks/midtransWebhook"));
const app = (0, express_1.default)();
let apolloServer = null;
let isInitialized = false;
async function initializeServer() {
    if (isInitialized)
        return;
    await (0, database_1.connectDB)();
    (0, redis_1.connectRedis)();
    apolloServer = new server_1.ApolloServer({
        typeDefs: typeDefs_1.typeDefs,
        resolvers: resolvers_1.default,
        introspection: config_1.config.nodeEnv !== "production",
        formatError: middlewares_1.formatGraphQLError,
    });
    await apolloServer.start();
    app.use((0, cors_1.default)({ origin: config_1.config.corsOrigin }));
    app.use("/api/webhook", express_1.default.json(), midtransWebhook_1.default);
    app.use(config_1.config.graphqlPath, express_1.default.json(), async (req, res) => {
        const contextValue = await (0, schema_1.createContext)({ req });
        const result = await apolloServer.executeOperation({
            query: req.body.query,
            variables: req.body.variables,
            operationName: req.body.operationName,
        }, { contextValue });
        if (result.body.kind === "single") {
            res.json(result.body.singleResult);
        }
        else {
            res.json({ errors: [{ message: "Streaming not supported" }] });
        }
    });
    isInitialized = true;
    console.log("=================================");
    console.log("FLOWIN Backend Initialized");
    console.log(`GraphQL Endpoint : ${config_1.config.graphqlPath}`);
    console.log(`Webhook Endpoint : /api/webhook/midtrans`);
    console.log(`Environment      : ${config_1.config.nodeEnv}`);
    console.log("=================================");
}
const handler = async (req, res) => {
    await initializeServer();
    app(req, res);
};
exports.default = handler;
if (config_1.config.nodeEnv !== "production") {
    initializeServer()
        .then(() => {
        app.listen(config_1.config.port, () => {
            console.log(`Local server running on http://localhost:${config_1.config.port}`);
        });
    })
        .catch((error) => {
        console.error("Failed to start local server:", error);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map