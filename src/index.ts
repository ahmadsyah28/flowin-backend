// ================================
// Load configuration (includes env validation)
// ================================
import { config } from "@/config";

// ================================
// Imports
// ================================
import express, { Request, Response } from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { connectDB } from "@/config/database";
import { connectRedis } from "@/config/redis";
import { createContext } from "@/schema";
import { typeDefs } from "@/schema/typeDefs";
import resolvers from "@/schema/resolvers";
import { formatGraphQLError } from "@/middlewares";
import { GraphQLContext } from "@/types";
import webhookRouter from "@/webhooks/midtransWebhook";

// ================================
// Singleton -- re-used across serverless invocations
// ================================
const app = express();
let apolloServer: ApolloServer<GraphQLContext> | null = null;
let isInitialized = false;

async function initializeServer(): Promise<void> {
  if (isInitialized) return;

  // 1. Connect MongoDB (guarded by readyState inside connectDB)
  await connectDB();

  // 2. Connect Redis
  connectRedis();

  // 3. Create & start Apollo Server (no drain plugin needed for serverless)
  apolloServer = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
    introspection: config.nodeEnv !== "production",
    formatError: formatGraphQLError,
  });

  await apolloServer.start();

  // 4. CORS
  app.use(cors({ origin: config.corsOrigin }));

  // 5. REST webhook route (harus sebelum GraphQL)
  app.use("/api/webhook", express.json(), webhookRouter);

  // 6. GraphQL middleware
  app.use(
    config.graphqlPath,
    express.json(),
    async (req: Request, res: Response) => {
      const contextValue = await createContext({ req });
      const result = await apolloServer!.executeOperation(
        {
          query: req.body.query,
          variables: req.body.variables,
          operationName: req.body.operationName,
        },
        { contextValue },
      );

      if (result.body.kind === "single") {
        res.json(result.body.singleResult);
      } else {
        res.json({ errors: [{ message: "Streaming not supported" }] });
      }
    },
  );

  isInitialized = true;

  console.log("=================================");
  console.log("FLOWIN Backend Initialized");
  console.log(`GraphQL Endpoint : ${config.graphqlPath}`);
  console.log(`Webhook Endpoint : /api/webhook/midtrans`);
  console.log(`Environment      : ${config.nodeEnv}`);
  console.log("=================================");
}

// ================================
// Serverless handler (Vercel)
// ================================
const handler = async (req: Request, res: Response): Promise<void> => {
  await initializeServer();
  app(req, res);
};

export default handler;

// ================================
// Local dev -- run as regular HTTP server
// ================================
if (config.nodeEnv !== "production") {
  initializeServer()
    .then(() => {
      app.listen(config.port, () => {
        console.log(`Local server running on http://localhost:${config.port}`);
      });
    })
    .catch((error) => {
      console.error("Failed to start local server:", error);
      process.exit(1);
    });
}
