import { ApolloServer } from "@apollo/server";
import { GraphQLContext } from "@/types";
export declare const createApolloServer: () => ApolloServer<GraphQLContext>;
export declare const createContext: ({ req, }: {
    req: any;
}) => Promise<GraphQLContext>;
//# sourceMappingURL=index.d.ts.map