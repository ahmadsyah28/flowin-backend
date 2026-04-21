"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.laporanTypeDefs = void 0;
exports.laporanTypeDefs = `
    #Enun untuk jenis Laporan
        enum JenisLaporan {
        AIR_TIDAK_MENGALIR
        AIR_KERUH
        KEBOCORAN_PIPA
        METERAN_BERMASALAH
        KENDALA_LAINNYA
    }

    # Enum untuk status laporan pelanggan
    enum WorkStatusPelanggan {
        DIAJUKAN
        DITUGASKAN
        DITINJAU_ADMIN
        SEDANG_DIKERJAKAN
        SELESAI
        DIBATALKAN
    }
    
    # Type untuk data laporan
    type Laporan {
        id: ObjectId!
        idPengguna: ObjectId!
        pengguna: Pengguna
        namaLaporan: String!
        masalah: String!
        alamat: String!
        imageURL: [String]!
        jenisLaporan: JenisLaporan!
        catatan: String
        koordinat: ObjectId!
        geoLokasi: GeoLokasi
        status: WorkStatusPelanggan!
        createdAt: Date!
        updatedAt: Date!
    }   
    
    # Input untuk membuat laporan baru
    input CreateLaporanInput {
        namaLaporan: String!
        masalah: String!
        alamat: String!
        imageURL: [String]
        jenisLaporan: JenisLaporan!
        catatan: String
        langitude: Float!
        longitude: Float!
    }
        
    # Input untuk update laporan
    input UpdateLaporanInput {
        namaLaporan: String
        masalah: String
        alamat: String
        imageURL: [String!]
        catatan: String
    }
    
     # Input untuk filter laporan
  input LaporanFilterInput {
    jenisLaporan: JenisLaporan
    status: WorkStatusPelanggan
  }

  # Response untuk operasi laporan
  type LaporanResponse {
    success: Boolean!
    message: String!
    data: Laporan
  }

  type LaporanListResponse {
    success: Boolean!
    message: String!
    data: [Laporan!]
    total: Int
  }

  extend type Query {
    # Mendapatkan semua laporan pengguna
    laporanList(filter: LaporanFilterInput): LaporanListResponse!
    # Mendapatkan detail laporan berdasarkan ID
    laporanById(id: ObjectId!): LaporanResponse!
    # Mendapatkan laporan aktif (belum selesai)
    laporanAktif: LaporanListResponse!
  }

  extend type Mutation {
    # Membuat laporan baru
    createLaporan(input: CreateLaporanInput!): LaporanResponse!
    # Update laporan (hanya jika status masih DIAJUKAN)
    updateLaporan(id: ObjectId!, input: UpdateLaporanInput!): LaporanResponse!
    # Batalkan laporan
    batalkanLaporan(id: ObjectId!): LaporanResponse!
  }
`;
//# sourceMappingURL=Laporan.js.map