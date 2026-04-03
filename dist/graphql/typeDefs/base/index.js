"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseTypeDefs = void 0;
exports.baseTypeDefs = `#graphql
  # ================================
  # Base Query and Mutation Types
  # ================================
  type Query {
    # Health check
    hello: String!
    dbStatus: String!
  }

  type Mutation

  # ================================
  # Auth Mutations
  # ================================
  extend type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
  }
`;
exports.default = exports.baseTypeDefs;
//# sourceMappingURL=index.js.map