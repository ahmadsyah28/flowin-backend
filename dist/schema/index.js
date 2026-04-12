"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = exports.createApolloServer = void 0;
const server_1 = require("@apollo/server");
const index_1 = require("./typeDefs/index");
const index_2 = __importDefault(require("./resolvers/index"));
const config_1 = require("../config");
const middlewares_1 = require("../middlewares");
const createApolloServer = () => {
    const server = new server_1.ApolloServer({
        typeDefs: index_1.typeDefs,
        resolvers: index_2.default,
        introspection: config_1.config.nodeEnv !== "production",
        formatError: middlewares_1.formatGraphQLError,
    });
    return server;
};
exports.createApolloServer = createApolloServer;
const createContext = async ({ req, }) => {
    return (0, middlewares_1.setupContext)(req);
};
exports.createContext = createContext;
//# sourceMappingURL=index.js.map