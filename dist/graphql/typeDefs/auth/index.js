"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authTypeDefs = void 0;
exports.authTypeDefs = `#graphql
  # ================================
  # Auth Types
  # ================================
  type AuthPayload {
    token: String!
    pengguna: Pengguna!
  }

  # ================================
  # Auth Input Types
  # ================================
  input RegisterInput {
    email: String!
    noHP: String!
    namaLengkap: String!
    password: String!
  }

  input UpdateProfileInput {
    noHP: String
    namaLengkap: String
  }
`;
exports.default = exports.authTypeDefs;
//# sourceMappingURL=index.js.map