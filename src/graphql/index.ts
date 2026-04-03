import { ApolloServer } from "@apollo/server";
import { typeDefs } from "./typeDefs/index";
import resolvers from "./resolvers/index";
import { GraphQLContext } from "@/types";
import { config } from "@/config";
import { formatGraphQLError, setupContext } from "@/middlewares";

/**
 * Create Apollo Server instance
 * Uses centralized config and error handler
 */
export const createApolloServer = (): ApolloServer<GraphQLContext> => {
  const server = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
    introspection: config.nodeEnv !== "production",
    formatError: formatGraphQLError,
  });

  return server;
};

/**
 * Context function untuk setiap request
 * Delegates to setupContext from middlewares
 */
export const createContext = async ({
  req,
}: {
  req: any;
}): Promise<GraphQLContext> => {
  return setupContext(req);
};
