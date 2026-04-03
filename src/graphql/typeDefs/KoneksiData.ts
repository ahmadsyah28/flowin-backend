export const koneksiDataTypeDefs = `
  # Enum status pengajuan koneksi
  enum StatusPengajuan {
    PENDING
    APPROVED
    REJECTED
  }

  # Type untuk data koneksi
  type KoneksiData {
    id: ObjectId!
    idPelanggan: ObjectId!
    pengguna: Pengguna
    statusPengajuan: StatusPengajuan!
    alasanPenolakan: String
    tanggalVerifikasi: Date
    nik: String!
    nikUrl: String!
    noKK: String!
    kkUrl: String!
    imb: String!
    imbUrl: String!
    alamat: String!
    kelurahan: String!
    kecamatan: String!
    luasBangunan: Float!
    createdAt: Date!
    updatedAt: Date!
  }

  # Input untuk membuat koneksi data baru
  input CreateKoneksiDataInput {
    nik: String!
    nikUrl: String!
    noKK: String!
    kkUrl: String!
    imb: String!
    imbUrl: String!
    alamat: String!
    kelurahan: String!
    kecamatan: String!
    luasBangunan: Float!
  }

  # Input untuk update koneksi data
  input UpdateKoneksiDataInput {
    nikUrl: String
    kkUrl: String
    imbUrl: String
    alamat: String
    kelurahan: String
    kecamatan: String
    luasBangunan: Float
  }

  # Response untuk cek status pengajuan
  type StatusPengajuanResponse {
    success: Boolean!
    message: String!
    statusPengajuan: StatusPengajuan
    alasanPenolakan: String
    tanggalVerifikasi: Date
    canSubmit: Boolean!
  }

  # Response untuk operasi koneksi data
  type KoneksiDataResponse {
    success: Boolean!
    message: String!
    data: KoneksiData
  }

  extend type Query {
    # Mendapatkan koneksi data pengguna
    koneksiData: KoneksiDataResponse!
    # Mendapatkan detail koneksi data berdasarkan ID
    koneksiDataById(id: ObjectId!): KoneksiDataResponse!
    # Cek status pengajuan koneksi pengguna
    cekStatusPengajuan: StatusPengajuanResponse!
  }

  extend type Mutation {
    # Membuat koneksi data baru (pendaftaran langganan PDAM)
    createKoneksiData(input: CreateKoneksiDataInput!): KoneksiDataResponse!
    # Update koneksi data
    updateKoneksiData(input: UpdateKoneksiDataInput!): KoneksiDataResponse!
  }
`;
