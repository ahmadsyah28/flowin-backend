"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.koneksiDataTypeDefs = void 0;
exports.koneksiDataTypeDefs = `#graphql
  # ================================
  # KoneksiData Types
  # ================================
  type KoneksiData {
    id: ID!
    IdPelanggan: ID!
    StatusVerifikasi: Boolean!
    NIK: String!
    NIKUrl: String!
    NoKK: String!
    KKUrl: String!
    IMB: String!
    IMBUrl: String!
    Alamat: String!
    Kelurahan: String!
    Kecamatan: String!
    LuasBangunan: Float!
    createdAt: DateTime
    updatedAt: DateTime
    # Populated fields
    pelanggan: Pengguna
  }

  # ================================
  # KoneksiData Input Types
  # ================================
  input CreateKoneksiDataInput {
    NIK: String!
    NIKUrl: String!
    NoKK: String!
    KKUrl: String!
    IMB: String!
    IMBUrl: String!
    Alamat: String!
    Kelurahan: String!
    Kecamatan: String!
    LuasBangunan: Float!
  }

  input UpdateKoneksiDataInput {
    Alamat: String
    Kelurahan: String
    Kecamatan: String
    LuasBangunan: Float
  }

  # ================================
  # KoneksiData Queries
  # ================================
  extend type Query {
    koneksiDataByPelanggan: KoneksiData
    koneksiDataById(id: ID!): KoneksiData
  }

  # ================================
  # KoneksiData Mutations
  # ================================
  extend type Mutation {
    createKoneksiData(input: CreateKoneksiDataInput!): KoneksiData!
    updateKoneksiData(id: ID!, input: UpdateKoneksiDataInput!): KoneksiData!
  }
`;
exports.default = exports.koneksiDataTypeDefs;
//# sourceMappingURL=index.js.map