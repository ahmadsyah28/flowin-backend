"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PembayaranService = void 0;
const midtrans_client_1 = __importDefault(require("midtrans-client"));
const Tagihan_1 = require("../models/Tagihan");
const Pengguna_1 = require("../models/Pengguna");
const Pembayaran_1 = require("../models/Pembayaran");
const Notifikasi_1 = require("../models/Notifikasi");
const Meter_1 = require("../models/Meter");
const KoneksiData_1 = require("../models/KoneksiData");
const enums_1 = require("../enums");
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
class PembayaranService {
    static generateOrderId(tagihanId) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `FLOWIN-${timestamp}-${random}`;
    }
    static async getPengguna(userId) {
        return Pengguna_1.Pengguna.findById(userId);
    }
    static async verifyTagihanOwnership(tagihanId, userId) {
        const tagihan = await Tagihan_1.Tagihan.findById(tagihanId);
        if (!tagihan)
            return null;
        const meter = await Meter_1.Meter.findById(tagihan.IdMeteran);
        if (!meter)
            return null;
        const koneksiData = await KoneksiData_1.KoneksiData.findById(meter.IdKoneksiData);
        if (!koneksiData)
            return null;
        if (koneksiData.IdPelanggan.toString() !== userId.toString()) {
            return null;
        }
        return tagihan;
    }
    static async createPayment(tagihanId, userId) {
        try {
            const pengguna = await this.getPengguna(userId);
            if (!pengguna) {
                return {
                    success: false,
                    message: "Pengguna tidak ditemukan",
                    data: null,
                };
            }
            const tagihan = await this.verifyTagihanOwnership(tagihanId, userId);
            if (!tagihan) {
                return {
                    success: false,
                    message: "Tagihan tidak ditemukan atau bukan milik Anda",
                    data: null,
                };
            }
            if (tagihan.StatusPembayaran === enums_1.EnumPaymentStatus.SETTLEMENT) {
                return {
                    success: false,
                    message: "Tagihan ini sudah lunas",
                    data: null,
                };
            }
            const existingPending = await Pembayaran_1.Pembayaran.findOne({
                IdTagihan: tagihan._id,
                StatusPembayaran: Pembayaran_1.EnumStatusPembayaran.PENDING,
            });
            if (existingPending) {
                return {
                    success: true,
                    message: "Pembayaran sudah dibuat sebelumnya, silakan lanjutkan",
                    data: {
                        pembayaran: existingPending,
                        snapToken: existingPending.SnapToken,
                        snapRedirectUrl: existingPending.SnapRedirectUrl,
                    },
                };
            }
            const orderId = this.generateOrderId(tagihanId);
            const itemDetails = [
                {
                    id: tagihan._id.toString(),
                    price: Math.round(tagihan.Biaya),
                    quantity: 1,
                    name: `Tagihan Air - ${tagihan.Periode}`,
                },
            ];
            if (tagihan.Denda && tagihan.Denda > 0) {
                itemDetails.push({
                    id: `denda-${tagihan._id.toString()}`,
                    price: Math.round(tagihan.Denda),
                    quantity: 1,
                    name: `Denda Keterlambatan - ${tagihan.Periode}`,
                });
            }
            const biayaBeban = Math.round(tagihan.TotalBiaya - tagihan.Biaya - (tagihan.Denda || 0));
            if (biayaBeban > 0) {
                itemDetails.push({
                    id: `beban-${tagihan._id.toString()}`,
                    price: biayaBeban,
                    quantity: 1,
                    name: `Biaya Beban - ${tagihan.Periode}`,
                });
            }
            const grossAmount = itemDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const midtransParameter = {
                transaction_details: {
                    order_id: orderId,
                    gross_amount: grossAmount,
                },
                item_details: itemDetails,
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
            const pembayaran = new Pembayaran_1.Pembayaran({
                IdTagihan: tagihan._id,
                IdPengguna: userId,
                MidtransOrderId: orderId,
                SnapToken: midtransResponse.token,
                SnapRedirectUrl: midtransResponse.redirect_url,
                JumlahBayar: tagihan.TotalBiaya,
                StatusPembayaran: Pembayaran_1.EnumStatusPembayaran.PENDING,
            });
            await pembayaran.save();
            return {
                success: true,
                message: "Pembayaran berhasil dibuat, silakan lanjutkan pembayaran",
                data: {
                    pembayaran,
                    snapToken: midtransResponse.token,
                    snapRedirectUrl: midtransResponse.redirect_url,
                },
            };
        }
        catch (error) {
            console.error("PembayaranService.createPayment error:", error);
            return {
                success: false,
                message: `Gagal membuat pembayaran: ${error.message}`,
                data: null,
            };
        }
    }
    static async handleMidtransNotification(notificationBody) {
        try {
            const statusResponse = await coreApi.transaction.notification(notificationBody);
            const { order_id, transaction_status, fraud_status, transaction_id, payment_type, } = statusResponse;
            const pembayaran = await Pembayaran_1.Pembayaran.findOne({
                MidtransOrderId: order_id,
            });
            if (!pembayaran) {
                return {
                    success: false,
                    message: `Pembayaran dengan order ID ${order_id} tidak ditemukan`,
                    data: null,
                };
            }
            const newStatus = this.mapMidtransStatus(transaction_status, fraud_status);
            pembayaran.StatusPembayaran = newStatus;
            pembayaran.MidtransTransactionId = transaction_id;
            pembayaran.MetodePembayaran = payment_type;
            pembayaran.MidtransResponse = statusResponse;
            if (newStatus === Pembayaran_1.EnumStatusPembayaran.SUKSES) {
                pembayaran.TanggalBayar = new Date();
            }
            await pembayaran.save();
            if (newStatus === Pembayaran_1.EnumStatusPembayaran.SUKSES) {
                await Tagihan_1.Tagihan.findByIdAndUpdate(pembayaran.IdTagihan, {
                    StatusPembayaran: enums_1.EnumPaymentStatus.SETTLEMENT,
                    TanggalPembayaran: new Date(),
                    MetodePembayaran: payment_type,
                });
                await this.createPaymentNotification(pembayaran.IdPengguna, pembayaran.IdTagihan, "SUKSES", pembayaran.JumlahBayar);
            }
            else if (newStatus === Pembayaran_1.EnumStatusPembayaran.GAGAL ||
                newStatus === Pembayaran_1.EnumStatusPembayaran.EXPIRED) {
                await this.createPaymentNotification(pembayaran.IdPengguna, pembayaran.IdTagihan, newStatus === Pembayaran_1.EnumStatusPembayaran.GAGAL ? "GAGAL" : "EXPIRED", pembayaran.JumlahBayar);
            }
            return {
                success: true,
                message: `Status pembayaran diperbarui: ${newStatus}`,
                data: pembayaran,
            };
        }
        catch (error) {
            console.error("PembayaranService.handleMidtransNotification error:", error);
            return {
                success: false,
                message: `Gagal memproses notifikasi: ${error.message}`,
                data: null,
            };
        }
    }
    static async checkTransactionStatus(orderId) {
        try {
            const statusResponse = await coreApi.transaction.status(orderId);
            const pembayaran = await Pembayaran_1.Pembayaran.findOne({
                MidtransOrderId: orderId,
            });
            if (!pembayaran) {
                return {
                    success: false,
                    message: "Pembayaran tidak ditemukan",
                    data: null,
                };
            }
            const newStatus = this.mapMidtransStatus(statusResponse.transaction_status, statusResponse.fraud_status);
            pembayaran.StatusPembayaran = newStatus;
            pembayaran.MidtransResponse = statusResponse;
            if (newStatus === Pembayaran_1.EnumStatusPembayaran.SUKSES) {
                pembayaran.TanggalBayar = pembayaran.TanggalBayar ?? new Date();
                pembayaran.MetodePembayaran =
                    statusResponse.payment_type ?? pembayaran.MetodePembayaran;
            }
            await pembayaran.save();
            if (newStatus === Pembayaran_1.EnumStatusPembayaran.SUKSES) {
                await Tagihan_1.Tagihan.findByIdAndUpdate(pembayaran.IdTagihan, {
                    StatusPembayaran: enums_1.EnumPaymentStatus.SETTLEMENT,
                    TanggalPembayaran: pembayaran.TanggalBayar,
                    MetodePembayaran: statusResponse.payment_type ?? pembayaran.MetodePembayaran,
                });
            }
            return {
                success: true,
                message: `Status: ${newStatus}`,
                data: pembayaran,
            };
        }
        catch (error) {
            console.error("PembayaranService.checkTransactionStatus error:", error);
            return {
                success: false,
                message: `Gagal cek status transaksi: ${error.message}`,
                data: null,
            };
        }
    }
    static async getMyPembayaran(userId, limit = 10, offset = 0) {
        try {
            const [data, total] = await Promise.all([
                Pembayaran_1.Pembayaran.find({ IdPengguna: userId })
                    .sort({ createdAt: -1 })
                    .skip(offset)
                    .limit(limit)
                    .populate({
                    path: "IdTagihan",
                    select: "Periode TotalPemakaian TotalBiaya StatusPembayaran",
                }),
                Pembayaran_1.Pembayaran.countDocuments({ IdPengguna: userId }),
            ]);
            return {
                success: true,
                message: "Berhasil mengambil riwayat pembayaran",
                data,
                total,
            };
        }
        catch (error) {
            console.error("PembayaranService.getMyPembayaran error:", error);
            return {
                success: false,
                message: `Gagal mengambil riwayat pembayaran: ${error.message}`,
                data: null,
                total: 0,
            };
        }
    }
    static async getPembayaranDetail(pembayaranId, userId) {
        try {
            const pembayaran = await Pembayaran_1.Pembayaran.findOne({
                _id: pembayaranId,
                IdPengguna: userId,
            }).populate({
                path: "IdTagihan",
                select: "Periode PenggunaanSebelum PenggunaanSekarang TotalPemakaian Biaya Denda TotalBiaya StatusPembayaran TenggatWaktu",
            });
            if (!pembayaran) {
                return {
                    success: false,
                    message: "Pembayaran tidak ditemukan",
                    data: null,
                };
            }
            return {
                success: true,
                message: "Berhasil mengambil detail pembayaran",
                data: pembayaran,
            };
        }
        catch (error) {
            console.error("PembayaranService.getPembayaranDetail error:", error);
            return {
                success: false,
                message: `Gagal mengambil detail pembayaran: ${error.message}`,
                data: null,
            };
        }
    }
    static mapMidtransStatus(transactionStatus, fraudStatus) {
        if (transactionStatus === "capture") {
            if (fraudStatus === "accept")
                return Pembayaran_1.EnumStatusPembayaran.SUKSES;
            return Pembayaran_1.EnumStatusPembayaran.PENDING;
        }
        switch (transactionStatus) {
            case "settlement":
                return Pembayaran_1.EnumStatusPembayaran.SUKSES;
            case "pending":
                return Pembayaran_1.EnumStatusPembayaran.PENDING;
            case "deny":
            case "cancel":
                return Pembayaran_1.EnumStatusPembayaran.GAGAL;
            case "expire":
                return Pembayaran_1.EnumStatusPembayaran.EXPIRED;
            case "refund":
            case "partial_refund":
                return Pembayaran_1.EnumStatusPembayaran.REFUND;
            default:
                return Pembayaran_1.EnumStatusPembayaran.PENDING;
        }
    }
    static async createPaymentNotification(userId, tagihanId, status, jumlah) {
        try {
            const jumlahFormatted = new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
            }).format(jumlah);
            let judul;
            let pesan;
            switch (status) {
                case "SUKSES":
                    judul = "Pembayaran Berhasil ✅";
                    pesan = `Pembayaran sebesar ${jumlahFormatted} telah berhasil. Terima kasih telah membayar tagihan air Anda.`;
                    break;
                case "GAGAL":
                    judul = "Pembayaran Gagal ❌";
                    pesan = `Pembayaran sebesar ${jumlahFormatted} gagal diproses. Silakan coba lagi.`;
                    break;
                case "EXPIRED":
                    judul = "Pembayaran Kadaluarsa ⏰";
                    pesan = `Pembayaran sebesar ${jumlahFormatted} telah kadaluarsa. Silakan buat pembayaran baru.`;
                    break;
            }
            await Notifikasi_1.Notifikasi.create({
                IdPelanggan: userId,
                Judul: judul,
                Pesan: pesan,
                Kategori: enums_1.EnumNotifikasiKategori.PEMBAYARAN,
                Link: null,
            });
        }
        catch (error) {
            console.error("Failed to create payment notification:", error);
        }
    }
}
exports.PembayaranService = PembayaranService;
//# sourceMappingURL=PembayaranService.js.map