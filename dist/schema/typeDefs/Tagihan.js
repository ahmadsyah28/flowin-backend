"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagihanTypeDefs = void 0;
exports.tagihanTypeDefs = `
    #Enum untuk status pembayaran
    enum PaymentStatus {
        PENDING
        SETTLEMENT
        CANCEL
        EXPIRE
        REFUND
        CHARGEBACK
        FRAUD
    }

    # Type untuk data tagihan
    type Tagihan {
        id: ObjectId!
        idMeteran: ObjectId!
        meteran: Meter
        periode: String!
        penggunaanSebelum: Float!
        penggunaanSesudah: Float!
        TotalPemakaian: Float!
        biaya: Float!
        totalBiaya: Float!
        statusPembayaran: PaymentStatus!
        tanggalPembayaran: Date
        metodePembayaran: String
        tenggatWaktu: Date!
        menunggak: Boolean!
        denda: Float!
        midtransOrderId: String
        snapRedirectUrl: String
        bulanCakupan: Int!
        periodeAkhir: String
        createdAt: Date!
        updatedAt: Date!
    }

    # Input untuk filter tagiihan
    input TagihanFilterInput {
        idMeteran: ObjectId
        periode: String
        statusPembayaran: PaymentStatus
        menunggak: Boolean
    }

    # Response untuk operasi tagihan
    type TagihanResponse {
        success: Boolean!
        message: String!
        data: Tagihan
    }

    type TagihanListResponse {
        success: Boolean!
        message: String!    
        data: [Tagihan]
        total: Int
    }

    # Response untuk buat pembayaran
    type BuatPembayaranData {
        snapToken: String!
        snapRedirectUrl: String!
        midtransOrderId: String!
        jumlahBayar: Float!
    }

    type BuatPembayaranResponse {
        success: Boolean!
        message: String!
        data: BuatPembayaranData
    }

    extend type Query {
        #  Mendapatkan semua tagihan pengguna
        tagihanList(filter: TagihanFilterInput): TagihanListResponse!
        # Mendapatkan detail tagihan berdasarkan ID
        tagihan(id: ObjectId!): TagihanResponse!
        # Mendapatkan tagihan aktif (belum dibayar)
        tagihanAktif: TagihanResponse!
        # Mendapatkan riwayat tagihan yang sudah dibayar
        tagihanRiwayat: TagihanListResponse!
    }

    extend type Mutation {
        # Bayar tagihan (manual, tanpa Midtrans)
        bayarTagihan(id: ObjectId!, metodePembayaran: String!): TagihanResponse!
        # Buat pembayaran via Midtrans Snap untuk semua tagihan belum bayar
        buatPembayaran: BuatPembayaranResponse!
    }
`;
//# sourceMappingURL=Tagihan.js.map