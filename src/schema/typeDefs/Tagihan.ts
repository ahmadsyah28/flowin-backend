export const tagihanTypeDefs = `
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
        # Bayar tagihan
        bayarTagihan(id: ObjectId!, metodePembayaran: String!): TagihanResponse!
    }
`;