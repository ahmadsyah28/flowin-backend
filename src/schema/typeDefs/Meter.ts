export const meterTypeDefs = `
  # Type untuk data meteran
  type Meter {
    id: ObjectId!
    idKelompokPelanggan: ObjectId!
    idKoneksiData: ObjectId!
    koneksiData: KoneksiData
    nomorMeteran: String!
    nomorAkun: String!
    createdAt: Date!
    updatedAt: Date!
  }

  # Response untuk operasi meter
  type MeterResponse {
    success: Boolean!
    message: String!
    data: Meter
  }

  type MeterListResponse {
    success: Boolean!
    message: String!
    data: [Meter!]
    total: Int
  }

  extend type Query {
    # Mendapatkan semua meteran pengguna
    meterList: MeterListResponse!
    # Mendapatkan detail meteran berdasarkan ID
    meterById(id: ObjectId!): MeterResponse!
    # Mendapatkan meteran berdasarkan nomor meteran
    meterByNomor(nomorMeteran: String!): MeterResponse!
  }
`;