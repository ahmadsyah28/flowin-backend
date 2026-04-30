"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagihanService = void 0;
const midtrans_client_1 = __importDefault(require("midtrans-client"));
const Tagihan_1 = require("../models/Tagihan");
const Meter_1 = require("../models/Meter");
const KoneksiData_1 = require("../models/KoneksiData");
const Pengguna_1 = require("../models/Pengguna");
const Notifikasi_1 = require("../models/Notifikasi");
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
class TagihanService {
    static async getUserMeterIds(userId) {
        const koneksiData = await KoneksiData_1.KoneksiData.findOne({ IdPelanggan: userId });
        if (!koneksiData)
            return [];
        const meters = await Meter_1.Meter.find({ IdKoneksiData: koneksiData._id });
        return meters.map((m) => m._id);
    }
    static async getTagihanList(userId, filter) {
        try {
            const meterIds = await this.getUserMeterIds(userId);
            if (meterIds.length === 0) {
                return {
                    success: false,
                    message: "Tidak ada meteran terdaftar",
                    data: null,
                    total: 0,
                };
            }
            const query = {
                IdMeteran: { $in: meterIds },
                StatusPembayaran: { $in: Object.values(enums_1.EnumPaymentStatus) },
            };
            if (filter?.idMeteran) {
                query.IdMeteran = filter.idMeteran;
            }
            if (filter?.periode) {
                query.Periode = filter.periode;
            }
            if (filter?.statusPembayaran) {
                query.StatusPembayaran = filter.statusPembayaran;
            }
            if (filter?.menunggak !== undefined) {
                query.Menunggak = filter.menunggak;
            }
            const tagihanList = await Tagihan_1.Tagihan.find(query)
                .populate("IdMeteran")
                .sort({ createdAt: -1 });
            return {
                success: true,
                message: "Berhasil mendapatkan daftar tagihan",
                data: tagihanList,
                total: tagihanList.length,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mendapatkan daftar tagihan",
                data: null,
                total: 0,
            };
        }
    }
    static async getTagihanById(id) {
        try {
            const tagihan = await Tagihan_1.Tagihan.findById(id).populate("IdMeteran");
            if (!tagihan) {
                return {
                    success: false,
                    message: "Tagihan tidak ditemukan",
                    data: null,
                };
            }
            return {
                success: true,
                message: "Berhasil mendapatkan tagihan",
                data: tagihan,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mendapatkan tagihan",
                data: null,
            };
        }
    }
    static async getTagihanAktif(userId) {
        try {
            const meterIds = await this.getUserMeterIds(userId);
            if (meterIds.length === 0) {
                return {
                    success: false,
                    message: "Tidak ada meteran terdaftar",
                    data: null,
                };
            }
            const tagihan = await Tagihan_1.Tagihan.findOne({
                IdMeteran: { $in: meterIds },
                StatusPembayaran: enums_1.EnumPaymentStatus.PENDING,
            })
                .populate("IdMeteran")
                .sort({ TenggatWaktu: 1 });
            if (!tagihan) {
                return {
                    success: true,
                    message: "Tidak ada tagihan aktif",
                    data: null,
                };
            }
            return {
                success: true,
                message: "Berhasil mendapatkan tagihan aktif",
                data: tagihan,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mendapatkan tagihan aktif",
                data: null,
            };
        }
    }
    static async getTagihanRiwayat(userId) {
        try {
            const meterIds = await this.getUserMeterIds(userId);
            if (meterIds.length === 0) {
                return {
                    success: false,
                    message: "Tidak ada meteran terdaftar",
                    data: null,
                    total: 0,
                };
            }
            const tagihanList = await Tagihan_1.Tagihan.find({
                IdMeteran: { $in: meterIds },
                StatusPembayaran: enums_1.EnumPaymentStatus.SETTLEMENT,
            })
                .populate("IdMeteran")
                .sort({ TanggalPembayaran: -1 });
            return {
                success: true,
                message: "Berhasil mendapatkan riwayat tagihan",
                data: tagihanList,
                total: tagihanList.length,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mendapatkan riwayat tagihan",
                data: null,
                total: 0,
            };
        }
    }
    static async bayarTagihan(id, userId, metodePembayaran) {
        try {
            const meterIds = await this.getUserMeterIds(userId);
            const tagihan = await Tagihan_1.Tagihan.findOne({
                _id: id,
                IdMeteran: { $in: meterIds },
            });
            if (!tagihan) {
                return {
                    success: false,
                    message: "Tagihan tidak ditemukan",
                    data: null,
                };
            }
            if (tagihan.StatusPembayaran === enums_1.EnumPaymentStatus.SETTLEMENT) {
                return {
                    success: false,
                    message: "Tagihan sudah dibayar",
                    data: null,
                };
            }
            const updatedTagihan = await Tagihan_1.Tagihan.findByIdAndUpdate(id, {
                StatusPembayaran: enums_1.EnumPaymentStatus.SETTLEMENT,
                TanggalPembayaran: new Date(),
                MetodePembayaran: metodePembayaran,
            }, { new: true }).populate("IdMeteran");
            return {
                success: true,
                message: "Berhasil membayar tagihan",
                data: updatedTagihan,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal membayar tagihan",
                data: null,
            };
        }
    }
    static generateOrderId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `FLOWIN-${timestamp}-${random}`;
    }
    static async createPayment(userId) {
        try {
            const pengguna = await Pengguna_1.Pengguna.findById(userId);
            if (!pengguna) {
                return {
                    success: false,
                    message: "Pengguna tidak ditemukan",
                    data: null,
                };
            }
            const meterIds = await this.getUserMeterIds(userId);
            if (meterIds.length === 0) {
                return {
                    success: false,
                    message: "Tidak ada meteran terdaftar",
                    data: null,
                };
            }
            const tagihanList = await Tagihan_1.Tagihan.find({
                IdMeteran: { $in: meterIds },
                StatusPembayaran: {
                    $in: [enums_1.EnumPaymentStatus.PENDING, enums_1.EnumPaymentStatus.EXPIRE],
                },
            }).sort({ TenggatWaktu: 1 });
            if (tagihanList.length === 0) {
                return {
                    success: false,
                    message: "Tidak ada tagihan yang belum dibayar",
                    data: null,
                };
            }
            const firstOrderId = tagihanList[0].MidtransOrderId;
            const firstRedirectUrl = tagihanList[0].SnapRedirectUrl;
            const allSameOrder = firstOrderId &&
                firstRedirectUrl &&
                tagihanList.every((t) => t.MidtransOrderId === firstOrderId);
            if (allSameOrder) {
                const totalBayar = tagihanList.reduce((sum, t) => sum + t.TotalBiaya, 0);
                return {
                    success: true,
                    message: "Pembayaran sudah dibuat sebelumnya, silakan lanjutkan",
                    data: {
                        snapToken: firstOrderId,
                        snapRedirectUrl: firstRedirectUrl,
                        midtransOrderId: firstOrderId,
                        jumlahBayar: totalBayar,
                    },
                };
            }
            const orderId = this.generateOrderId();
            const itemDetails = [];
            for (const tagihan of tagihanList) {
                itemDetails.push({
                    id: tagihan._id.toString(),
                    price: Math.round(tagihan.Biaya),
                    quantity: 1,
                    name: `Tagihan Air - ${tagihan.Periode}`,
                });
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
            }
            const grossAmount = itemDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const midtransResponse = await snap.createTransaction({
                transaction_details: { order_id: orderId, gross_amount: grossAmount },
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
            });
            const tagihanIds = tagihanList.map((t) => t._id);
            await Tagihan_1.Tagihan.updateMany({ _id: { $in: tagihanIds } }, {
                MidtransOrderId: orderId,
                SnapRedirectUrl: midtransResponse.redirect_url,
            });
            return {
                success: true,
                message: "Pembayaran berhasil dibuat, silakan lanjutkan pembayaran",
                data: {
                    snapToken: midtransResponse.token,
                    snapRedirectUrl: midtransResponse.redirect_url,
                    midtransOrderId: orderId,
                    jumlahBayar: grossAmount,
                },
            };
        }
        catch (error) {
            console.error("TagihanService.createPayment error:", error);
            return {
                success: false,
                message: `Gagal membuat pembayaran: ${error.message}`,
                data: null,
            };
        }
    }
    static mapMidtransStatus(transactionStatus, fraudStatus) {
        if (transactionStatus === "capture") {
            return fraudStatus === "accept"
                ? enums_1.EnumPaymentStatus.SETTLEMENT
                : enums_1.EnumPaymentStatus.PENDING;
        }
        if (transactionStatus === "settlement")
            return enums_1.EnumPaymentStatus.SETTLEMENT;
        if (transactionStatus === "cancel" || transactionStatus === "deny")
            return enums_1.EnumPaymentStatus.CANCEL;
        if (transactionStatus === "expire")
            return enums_1.EnumPaymentStatus.EXPIRE;
        return enums_1.EnumPaymentStatus.PENDING;
    }
    static async handleMidtransNotification(notificationBody) {
        try {
            const statusResponse = await coreApi.transaction.notification(notificationBody);
            const { order_id, transaction_status, fraud_status, transaction_id, payment_type, } = statusResponse;
            const tagihanList = await Tagihan_1.Tagihan.find({ MidtransOrderId: order_id });
            if (tagihanList.length === 0) {
                return {
                    success: false,
                    message: `Tagihan dengan order ID ${order_id} tidak ditemukan`,
                };
            }
            const newStatus = this.mapMidtransStatus(transaction_status, fraud_status);
            for (const tagihan of tagihanList) {
                tagihan.StatusPembayaran = newStatus;
                if (newStatus === enums_1.EnumPaymentStatus.SETTLEMENT) {
                    tagihan.TanggalPembayaran = new Date();
                    tagihan.MetodePembayaran = payment_type;
                }
                await tagihan.save();
            }
            if (newStatus === enums_1.EnumPaymentStatus.SETTLEMENT) {
                const firstTagihan = tagihanList[0];
                const meter = await Meter_1.Meter.findById(firstTagihan.IdMeteran);
                const koneksiData = meter
                    ? await KoneksiData_1.KoneksiData.findById(meter.IdKoneksiData)
                    : null;
                if (koneksiData) {
                    const totalBayar = tagihanList.reduce((sum, t) => sum + t.TotalBiaya, 0);
                    const periodeList = tagihanList.map((t) => t.Periode).join(", ");
                    await Notifikasi_1.Notifikasi.create({
                        IdPelanggan: koneksiData.IdPelanggan,
                        Judul: "Pembayaran Berhasil",
                        Pesan: `Pembayaran tagihan periode ${periodeList} sebesar Rp ${totalBayar.toLocaleString("id-ID")} telah berhasil.`,
                        Kategori: enums_1.EnumNotifikasiKategori.PEMBAYARAN,
                        isRead: false,
                    });
                }
            }
            return {
                success: true,
                message: `Tagihan ${order_id} diupdate ke status ${newStatus}`,
            };
        }
        catch (error) {
            console.error("TagihanService.handleMidtransNotification error:", error);
            return {
                success: false,
                message: `Gagal memproses notifikasi: ${error.message}`,
            };
        }
    }
}
exports.TagihanService = TagihanService;
//# sourceMappingURL=TagihanService.js.map