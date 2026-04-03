"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.laporanTypeDefs = void 0;
exports.laporanTypeDefs = `#graphql
  # ================================
  # Laporan Types
  # ================================
  type Laporan {
    id: ID!
    IdPengguna: ID!
    NamaLaporan: String!
    Masalah: String!
    Alamat: String!
    ImageURL: [String!]!
    JenisLaporan: JenisLaporan!
    Catatan: String!
    Koordinat: ID!
    Status: WorkStatusPelanggan!
    createdAt: DateTime
    updatedAt: DateTime
    # Populated fields
    pengguna: Pengguna
    geoLokasi: GeoLokasi
  }

  # ================================
  # Laporan Input Types
  # ================================
  input CreateLaporanInput {
    NamaLaporan: String!
    Masalah: String!
    Alamat: String!
    ImageURL: [String!]
    JenisLaporan: JenisLaporan!
    Catatan: String
    Latitude: Float!
    Longitude: Float!
  }

  # ================================
  # Laporan Queries
  # ================================
  extend type Query {
    laporanByPengguna(penggunaId: ID): [Laporan!]!
    laporanById(id: ID!): Laporan
    laporanByStatus(status: WorkStatusPelanggan!): [Laporan!]!
  }

  # ================================
  # Laporan Mutations
  # ================================
  extend type Mutation {
    createLaporan(input: CreateLaporanInput!): Laporan!
    updateLaporanStatus(id: ID!, status: WorkStatusPelanggan!): Laporan!
  }
`;
exports.default = exports.laporanTypeDefs;
//# sourceMappingURL=index.js.map