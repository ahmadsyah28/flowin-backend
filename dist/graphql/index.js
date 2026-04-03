"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = exports.createApolloServer = void 0;
const server_1 = require("@apollo/server");
const graphql_1 = require("graphql");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_js_1 = require("./typeDefs/index.js");
const index_js_2 = __importDefault(require("./resolvers/index.js"));
const models_1 = require("@/models");
const createApolloServer = () => {
    const server = new server_1.ApolloServer({
        typeDefs: index_js_1.typeDefs,
        resolvers: index_js_2.default,
        introspection: process.env.NODE_ENV !== "production",
        formatError: (formattedError, error) => {
            if (error instanceof graphql_1.GraphQLError) {
                console.error("GraphQL Error:", error.message);
                console.error("Stack:", error.stack);
            }
            return {
                message: formattedError.message,
                extensions: {
                    code: formattedError.extensions?.code || "INTERNAL_SERVER_ERROR",
                    ...formattedError.extensions,
                },
                locations: formattedError.locations,
                path: formattedError.path,
            };
        },
    });
    return server;
};
exports.createApolloServer = createApolloServer;
const createContext = async ({ req, }) => {
    const token = req.headers.authorization?.replace("Bearer ", "") || "";
    let user = undefined;
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const foundUser = await models_1.Pengguna.findById(decoded.penggunaId);
            if (foundUser) {
                user = foundUser;
            }
            else {
                console.warn("User not found for token");
            }
        }
        catch (error) {
            if (error instanceof Error) {
                console.warn("Invalid token:", error.message);
            }
        }
    }
    return {
        req,
        token,
        user,
    };
};
exports.createContext = createContext;
//# sourceMappingURL=index.js.map