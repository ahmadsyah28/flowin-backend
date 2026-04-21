"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifikasiTypeDefs = void 0;
exports.notifikasiTypeDefs = `
  # Enum untuk kategori notifikasi
  enum NotifikasiKategori {
    PEMBAYARAN
    INFORMASI
  }

  # Type untuk data notifikasi
  type Notifikasi {
    id: ObjectId!
    idPelanggan: ObjectId!
    idAdmin: ObjectId
    idTeknisi: ObjectId
    judul: String!
    pesan: String!
    kategori: NotifikasiKategori!
    link: String
    isRead: Boolean!
    createdAt: Date!
    updatedAt: Date!
  }

  # Input untuk filter notifikasi
  input NotifikasiFilterInput {
    kategori: NotifikasiKategori
  }

  # Response untuk operasi notifikasi
  type NotifikasiResponse {
    success: Boolean!
    message: String!
    data: Notifikasi
  }

  type NotifikasiListResponse {
    success: Boolean!
    message: String!
    data: [Notifikasi!]
    total: Int
    unreadCount: Int
  }

  extend type Query {
    # Mendapatkan semua notifikasi pengguna
    notifikasiList(filter: NotifikasiFilterInput): NotifikasiListResponse!
    # Mendapatkan detail notifikasi berdasarkan ID
    notifikasiById(id: ObjectId!): NotifikasiResponse!
  }

  extend type Mutation {
    # Menandai notifikasi sebagai sudah dibaca
    markNotifikasiAsRead(id: ObjectId!): NotifikasiResponse!
  }
`;
//# sourceMappingURL=Notifikasi.js.map