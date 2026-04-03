"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meterTypeDefs = void 0;
exports.meterTypeDefs = `#graphql
  # ================================
  # Meter Types
  # ================================
  type Meter {
    id: ID!
    IdKelompokPelanggan: ID!
    IdKoneksiData: ID!
    NomorMeteran: String!
    NomorAkun: String!
    createdAt: DateTime
    updatedAt: DateTime
    # Populated fields
    koneksiData: KoneksiData
  }

  # No specific queries or mutations for Meter in current schema
`;
exports.default = exports.meterTypeDefs;
//# sourceMappingURL=index.js.map