"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifikasiTypeDefs = void 0;
exports.notifikasiTypeDefs = `#graphql
  # ================================
  # Notifikasi Types
  # ================================
  type Notifikasi {
    id: ID!
    IdPelanggan: ID!
    IdAdmin: ID!
    IdTeknisi: ID!
    Judul: String!
    Pesan: String!
    Kategori: NotifikasiKategori!
    Link: String
    createdAt: DateTime
    updatedAt: DateTime
  }

  # ================================
  # Notifikasi Queries
  # ================================
  extend type Query {
    notifikasiByPelanggan(pelangganId: ID): [Notifikasi!]!
  }
`;
exports.default = exports.notifikasiTypeDefs;
//# sourceMappingURL=index.js.map