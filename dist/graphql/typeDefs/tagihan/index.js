"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagihanTypeDefs = void 0;
exports.tagihanTypeDefs = `#graphql
  # ================================
  # Tagihan Types
  # ================================
  type Tagihan {
    id: ID!
    IdMeteran: ID!
    Periode: String!
    PenggunaanSebelum: Float!
    PenggunaanSekarang: Float!
    TotalPemakaian: Float!
    Biaya: Float!
    TotalBiaya: Float!
    StatusPembayaran: PaymentStatus!
    TanggalPembayaran: DateTime
    MetodePembayaran: String
    TenggatWaktu: DateTime!
    Menunggak: Boolean!
    Denda: Float!
    Catatan: String
    createdAt: DateTime
    updatedAt: DateTime
    # Populated fields
    meter: Meter
  }

  # ================================
  # Tagihan Queries
  # ================================
  extend type Query {
    tagihanByPengguna(penggunaId: ID): [Tagihan!]!
    tagihanById(id: ID!): Tagihan
    tagihanByStatus(status: PaymentStatus!): [Tagihan!]!
  }

  # ================================
  # Tagihan Mutations
  # ================================
  extend type Mutation {
    bayarTagihan(id: ID!, metodePembayaran: String!): Tagihan!
  }
`;
exports.default = exports.tagihanTypeDefs;
//# sourceMappingURL=index.js.map