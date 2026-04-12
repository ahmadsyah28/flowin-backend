"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RABService = void 0;
const midtrans_client_1 = __importDefault(require("midtrans-client"));
const RAB_1 = require("@/models/RAB");
const KoneksiData_1 = require("@/models/KoneksiData");
const Pengguna_1 = require("@/models/Pengguna");
const Notifikasi_1 = require("@/models/Notifikasi");
const enums_1 = require("@/enums");
const snap = new midtrans_client_1.default.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey: process.env.MIDTRANS_SERVER_KEY || "",
    clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});
const coreApi = new midtrans_client_1.default.CoreApi({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey: process.env.MIDTRANS_SERVER_KEY || "",
    clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});
class RABService {
    static async getRABByKoneksiData(userId) {
        try {
            const koneksiData = await KoneksiData_1.KoneksiData.findOne({ IdPelanggan: userId });
            if (!koneksiData) {
                return {
                    success: false,
                    message: "Koneksi data tidak ditemukan",
                    data: null,
                };
            }
            const rab = await RAB_1.RAB.findOne({ idKoneksiData: koneksiData._id });
            if (!rab) {
                return {
                    success: false,
                    message: "RAB belum tersedia",
                    data: null,
                };
            }
            return {
                success: true,
                message: "Berhasil mendapatkan RAB",
                data: rab,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mendapatkan RAB",
                data: null,
            };
        }
    }
    static async createRABPayment(userId) {
        try {
            const pengguna = await Pengguna_1.Pengguna.findById(userId);
            if (!pengguna) {
                return {
                    success: false,
                    message: "Pengguna tidak ditemukan",
                    data: null,
                };
            }
            const koneksiData = await KoneksiData_1.KoneksiData.findOne({ IdPelanggan: userId });
            if (!koneksiData) {
                return {
                    success: false,
                    message: "Koneksi data tidak ditemukan",
                    data: null,
                };
            }
            if (koneksiData.StatusPengajuan !== enums_1.StatusPengajuan.APPROVED) {
                return {
                    success: false,
                    message: "Pengajuan belum disetujui",
                    data: null,
                };
            }
            const rab = await RAB_1.RAB.findOne({ idKoneksiData: koneksiData._id });
            if (!rab) {
                return {
                    success: false,
                    message: "RAB belum tersedia. Menunggu survei teknisi",
                    data: null,
                };
            }
            if (!rab.totalBiaya || rab.totalBiaya <= 0) {
                return {
                    success: false,
                    message: "Total biaya RAB belum ditentukan",
                    data: null,
                };
            }
            if (rab.statusPembayaran === enums_1.EnumPaymentStatus.SETTLEMENT) {
                return {
                    success: false,
                    message: "Pembayaran RAB sudah lunas",
                    data: null,
                };
            }
            if (rab.orderId &&
                rab.paymentUrl &&
                rab.statusPembayaran === enums_1.EnumPaymentStatus.PENDING) {
                return {
                    success: true,
                    message: "Pembayaran sudah dibuat sebelumnya, silakan lanjutkan",
                    data: {
                        rab,
                        snapToken: rab.orderId,
                        snapRedirectUrl: rab.paymentUrl,
                    },
                };
            }
            const orderId = `RAB-${koneksiData._id}-${Date.now()}`;
            const midtransParameter = {
                transaction_details: {
                    order_id: orderId,
                    gross_amount: Math.round(rab.totalBiaya),
                },
                item_details: [
                    {
                        id: rab._id.toString(),
                        price: Math.round(rab.totalBiaya),
                        quantity: 1,
                        name: "Biaya Pemasangan Koneksi Air PDAM",
                    },
                ],
                customer_details: {
                    first_name: pengguna.namaLengkap,
                    email: pengguna.email,
                    phone: pengguna.noHP || "",
                },
                callbacks: {
                    finish: `${process.env.MIDTRANS_CALLBACK_URL || "flowin://payment"}/finish`,
                    error: `${process.env.MIDTRANS_CALLBACK_URL || "flowin://payment"}/error`,
                    pending: `${process.env.MIDTRANS_CALLBACK_URL || "flowin://payment"}/pending`,
                },
            };
            const midtransResponse = await snap.createTransaction(midtransParameter);
            rab.orderId = orderId;
            rab.paymentUrl = midtransResponse.redirect_url;
            rab.statusPembayaran = enums_1.EnumPaymentStatus.PENDING;
            await rab.save();
            return {
                success: true,
                message: "Pembayaran RAB berhasil dibuat, silakan lanjutkan pembayaran",
                data: {
                    rab,
                    snapToken: midtransResponse.token,
                    snapRedirectUrl: midtransResponse.redirect_url,
                },
            };
        }
        catch (error) {
            console.error("RABService.createRABPayment error:", error);
            return {
                success: false,
                message: `Gagal membuat pembayaran RAB: ${error.message}`,
                data: null,
            };
        }
    }
    static async handleRABNotification(notificationBody) {
        try {
            const statusResponse = await coreApi.transaction.notification(notificationBody);
            const { order_id, transaction_status, fraud_status } = statusResponse;
            const rab = await RAB_1.RAB.findOne({ orderId: order_id });
            if (!rab) {
                return {
                    success: false,
                    message: `RAB dengan order ID ${order_id} tidak ditemukan`,
                    data: null,
                };
            }
            let newStatus;
            if (transaction_status === "settlement" ||
                transaction_status === "capture") {
                if (fraud_status === "accept" || !fraud_status) {
                    newStatus = enums_1.EnumPaymentStatus.SETTLEMENT;
                }
                else {
                    newStatus = enums_1.EnumPaymentStatus.FRAUD;
                }
            }
            else if (transaction_status === "pending") {
                newStatus = enums_1.EnumPaymentStatus.PENDING;
            }
            else if (transaction_status === "cancel" ||
                transaction_status === "deny") {
                newStatus = enums_1.EnumPaymentStatus.CANCEL;
            }
            else if (transaction_status === "expire") {
                newStatus = enums_1.EnumPaymentStatus.EXPIRE;
            }
            else if (transaction_status === "refund" ||
                transaction_status === "partial_refund") {
                newStatus = enums_1.EnumPaymentStatus.REFUND;
            }
            else {
                newStatus = enums_1.EnumPaymentStatus.PENDING;
            }
            rab.statusPembayaran = newStatus;
            await rab.save();
            if (newStatus === enums_1.EnumPaymentStatus.SETTLEMENT) {
                const koneksiData = await KoneksiData_1.KoneksiData.findById(rab.idKoneksiData);
                if (koneksiData) {
                    await Notifikasi_1.Notifikasi.create({
                        IdPelanggan: koneksiData.IdPelanggan,
                        Judul: "Pembayaran RAB Berhasil",
                        Pesan: `Pembayaran biaya pemasangan sebesar Rp ${rab.totalBiaya?.toLocaleString("id-ID")} berhasil. Teknisi akan segera melakukan instalasi.`,
                        Kategori: enums_1.EnumNotifikasiKategori.PEMBAYARAN,
                        Link: null,
                    });
                }
            }
            return {
                success: true,
                message: `Status pembayaran RAB diperbarui: ${newStatus}`,
                data: rab,
            };
        }
        catch (error) {
            console.error("RABService.handleRABNotification error:", error);
            return {
                success: false,
                message: `Gagal memproses notifikasi RAB: ${error.message}`,
                data: null,
            };
        }
    }
}
exports.RABService = RABService;
//# sourceMappingURL=RABService.js.map