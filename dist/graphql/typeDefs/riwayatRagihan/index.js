"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.riwayatRagihanTypeDefs = void 0;
exports.riwayatRagihanTypeDefs = `#graphql
  # ================================
  # RiwayatRagihan Types
  # ================================
  type RiwayatRagihan {
    id: ID!
    MeteranId: ID!
    PenggunaanAir: Float!
    createdAt: DateTime
    updatedAt: DateTime
    # Populated fields
    meter: Meter
  }

  # ================================
  # RiwayatRagihan Queries
  # ================================
  extend type Query {
    riwayatRagihanByMeter(meterId: ID!): [RiwayatRagihan!]!
  }
`;
exports.default = exports.riwayatRagihanTypeDefs;
//# sourceMappingURL=index.js.map