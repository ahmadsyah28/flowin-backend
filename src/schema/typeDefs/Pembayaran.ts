export const pembayaranTypeDefs = `
    # Enum untuk status pembayaran di Midtrans
    enum StatusPembayaran {
        Pending
        Settlement
        Cancel
        Expire
        Refund
    }

    # Type untuk data pembayaran
    type Pembayaran {
        id: ObjectId!
        idTagihan: ObjectId!
        tagihan: Tagihan
        idPengguna: ObjectId!
        midtransOrderId: String!
        midtransTransactionId: String
        snapToken: String!
        snapRedirectUrl: String!
        metodePembayaran: String
        jumlahBayar: Float!
        statusPembayaran: StatusPembayaran!
        tanggalBayar: Date
        createdAt: Date!
        updatedAt: Date!
    }

    # Response untuk create payment (berisi snap token)
    type CreatePaymentData {
        pembayaran: Pembayaran!
        snapToken: String!
        snapRedirectUrl: String!
    }

    type CreatePaymentResponse {
        success: Boolean!
        message: String!
        data: CreatePaymentData
    }

    # Response untuk operasi pembayaran
    type PembayaranResponse {
        success: Boolean!
        message: String!
        data: Pembayaran
    }

    type PembayaranListResponse {
        success: Boolean!
        message: String!
        data: [Pembayaran]
        total: Int
    }

    extend type Query {
        # Mendapatkan riwayat pembayaran user
        pembayaranList(limit: Int, offset: Int): PembayaranListResponse!
        # Mendapatkan detail pembayaran
        pembayaran(id: ObjectId!): PembayaranResponse!
    }

    extend type Mutation {
        # Buat pembayaran baru (dapat snap token untuk Midtrans)
        buatPembayaran(tagihanId: ObjectId!): CreatePaymentResponse!
    }
`;
