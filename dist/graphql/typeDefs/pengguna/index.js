"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.penggunaTypeDefs = void 0;
exports.penggunaTypeDefs = `#graphql
  # ================================
  # Pengguna Types
  # ================================
  type Pengguna {
    id: ID!
    email: String!
    noHP: String!
    namaLengkap: String!
    isVerified: Boolean!
    createdAt: DateTime
    updatedAt: DateTime
  }

  # ================================
  # Pengguna Queries
  # ================================
  extend type Query {
    me: Pengguna
    penggunaById(id: ID!): Pengguna
  }

  # ================================
  # Pengguna Mutations
  # ================================
  extend type Mutation {
    updateProfile(input: UpdateProfileInput!): Pengguna!
    changePassword(oldPassword: String!, newPassword: String!): Boolean!
  }
`;
exports.default = exports.penggunaTypeDefs;
//# sourceMappingURL=index.js.map