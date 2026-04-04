"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.riwayatPenggunaanTypeDefs = void 0;
exports.riwayatPenggunaanTypeDefs = `
  # Type untuk data riwayat penggunaan
  type RiwayatPenggunaan {
    id: ObjectId!
    meteranId: ObjectId!
    meteran: Meter
    penggunaanAir: Float!
    createdAt: Date!
    updatedAt: Date!
  }

  # Response untuk operasi riwayat penggunaan
  type RiwayatPenggunaanListResponse {
    success: Boolean!
    message: String!
    data: [RiwayatPenggunaan!]
    total: Int
  }

  extend type Query {
    # Mendapatkan riwayat penggunaan air
    riwayatPenggunaan(meteranId: ObjectId!): RiwayatPenggunaanListResponse!
  }
`;
//# sourceMappingURL=RiwayatPenggunaan.js.map