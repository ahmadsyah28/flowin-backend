export const rabTypeDefs = `
  # Type untuk RAB (Rencana Anggaran Biaya)
  type RAB {
    id: ObjectId!
    idKoneksiData: ObjectId!
    totalBiaya: Float
    statusPembayaran: String!
    orderId: String
    paymentUrl: String
    urlRab: String
    catatan: String
    createdAt: Date!
    updatedAt: Date!
  }

  # Response untuk operasi RAB
  type RABResponse {
    success: Boolean!
    message: String!
    data: RAB
  }

  # Response untuk pembayaran RAB
  type RABPaymentResponse {
    success: Boolean!
    message: String!
    snapToken: String
    snapRedirectUrl: String
  }

  extend type Query {
    # Get RAB untuk koneksi data user yang sedang login
    getMyRAB: RABResponse!
  }

  extend type Mutation {
    # Buat pembayaran RAB via Midtrans
    createRABPayment: RABPaymentResponse!
  }
`;
