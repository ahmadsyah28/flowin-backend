export const riwayatPenggunaanTypeDefs = `
  # Type untuk data riwayat penggunaan (raw IoT records)
  type RiwayatPenggunaan {
    id: ObjectId!
    meteranId: String!
    penggunaanAir: Float!
    timestamp: Date!
  }

  # Response untuk operasi riwayat penggunaan
  type RiwayatPenggunaanListResponse {
    success: Boolean!
    message: String!
    data: [RiwayatPenggunaan!]
    total: Int
  }

  extend type Query {
    # Mendapatkan riwayat penggunaan air berdasarkan meteranId (string)
    riwayatPenggunaan(meteranId: String!): RiwayatPenggunaanListResponse!
  }
`;
