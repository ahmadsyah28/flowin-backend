import midtransClient from "midtrans-client";
import { Types } from "mongoose";
import { RAB, IRABDocument } from "@/models/RAB";
import { KoneksiData } from "@/models/KoneksiData";
import { Pengguna } from "@/models/Pengguna";
import { Notifikasi } from "@/models/Notifikasi";
import {
  EnumPaymentStatus,
  StatusPengajuan,
  EnumNotifikasiKategori,
} from "@/enums";

// ============================================================
// Midtrans Client Initialization
// ============================================================

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

const coreApi = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

// ============================================================
// Interfaces
// ============================================================

export interface RABResponse {
  success: boolean;
  message: string;
  data: IRABDocument | null;
}

interface RABPaymentResponse {
  success: boolean;
  message: string;
  data: {
    rab: IRABDocument;
    snapToken: string;
    snapRedirectUrl: string;
  } | null;
}

// ============================================================
// RAB Service
// ============================================================

export class RABService {
  /**
   * Get RAB by koneksi data ID
   */
  static async getRABByKoneksiData(
    userId: string | Types.ObjectId,
  ): Promise<RABResponse> {
    try {
      const koneksiData = await KoneksiData.findOne({ IdPelanggan: userId });
      if (!koneksiData) {
        return {
          success: false,
          message: "Koneksi data tidak ditemukan",
          data: null,
        };
      }

      const rab = await RAB.findOne({ idKoneksiData: koneksiData._id });
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
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal mendapatkan RAB",
        data: null,
      };
    }
  }

  /**
   * Create payment for RAB via Midtrans Snap
   */
  static async createRABPayment(
    userId: string | Types.ObjectId,
  ): Promise<RABPaymentResponse> {
    try {
      // 1. Validasi pengguna
      const pengguna = await Pengguna.findById(userId);
      if (!pengguna) {
        return {
          success: false,
          message: "Pengguna tidak ditemukan",
          data: null,
        };
      }

      // 2. Cari koneksi data
      const koneksiData = await KoneksiData.findOne({ IdPelanggan: userId });
      if (!koneksiData) {
        return {
          success: false,
          message: "Koneksi data tidak ditemukan",
          data: null,
        };
      }

      if (koneksiData.StatusPengajuan !== StatusPengajuan.APPROVED) {
        return {
          success: false,
          message: "Pengajuan belum disetujui",
          data: null,
        };
      }

      // 3. Cari RAB
      const rab = await RAB.findOne({ idKoneksiData: koneksiData._id });
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

      // 4. Cek apakah sudah settlement
      if (rab.statusPembayaran === EnumPaymentStatus.SETTLEMENT) {
        return {
          success: false,
          message: "Pembayaran RAB sudah lunas",
          data: null,
        };
      }

      // 5. Jika sudah ada paymentUrl yang masih pending, kembalikan yang ada
      if (
        rab.orderId &&
        rab.paymentUrl &&
        rab.statusPembayaran === EnumPaymentStatus.PENDING
      ) {
        return {
          success: true,
          message: "Pembayaran sudah dibuat sebelumnya, silakan lanjutkan",
          data: {
            rab,
            snapToken: rab.orderId, // orderId digunakan sebagai referensi
            snapRedirectUrl: rab.paymentUrl,
          },
        };
      }

      // 6. Generate order ID unik
      const orderId = `RAB-${koneksiData._id}-${Date.now()}`;

      // 7. Buat transaksi di Midtrans
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

      // 8. Update RAB dengan data Midtrans
      rab.orderId = orderId;
      rab.paymentUrl = midtransResponse.redirect_url;
      rab.statusPembayaran = EnumPaymentStatus.PENDING;
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
    } catch (error: any) {
      console.error("RABService.createRABPayment error:", error);
      return {
        success: false,
        message: `Gagal membuat pembayaran RAB: ${error.message}`,
        data: null,
      };
    }
  }

  /**
   * Handle webhook notification for RAB payment
   * Called when order_id starts with "RAB-"
   */
  static async handleRABNotification(
    notificationBody: any,
  ): Promise<RABResponse> {
    try {
      // 1. Verifikasi notifikasi dari Midtrans
      const statusResponse = await (coreApi as any).transaction.notification(
        notificationBody,
      );

      const { order_id, transaction_status, fraud_status } = statusResponse;

      // 2. Cari RAB berdasarkan order ID
      const rab = await RAB.findOne({ orderId: order_id });
      if (!rab) {
        return {
          success: false,
          message: `RAB dengan order ID ${order_id} tidak ditemukan`,
          data: null,
        };
      }

      // 3. Map status Midtrans ke EnumPaymentStatus
      let newStatus: EnumPaymentStatus;

      if (
        transaction_status === "settlement" ||
        transaction_status === "capture"
      ) {
        if (fraud_status === "accept" || !fraud_status) {
          newStatus = EnumPaymentStatus.SETTLEMENT;
        } else {
          newStatus = EnumPaymentStatus.FRAUD;
        }
      } else if (transaction_status === "pending") {
        newStatus = EnumPaymentStatus.PENDING;
      } else if (
        transaction_status === "cancel" ||
        transaction_status === "deny"
      ) {
        newStatus = EnumPaymentStatus.CANCEL;
      } else if (transaction_status === "expire") {
        newStatus = EnumPaymentStatus.EXPIRE;
      } else if (
        transaction_status === "refund" ||
        transaction_status === "partial_refund"
      ) {
        newStatus = EnumPaymentStatus.REFUND;
      } else {
        newStatus = EnumPaymentStatus.PENDING;
      }

      // 4. Update RAB
      rab.statusPembayaran = newStatus;
      await rab.save();

      // 5. Kirim notifikasi ke pelanggan jika settlement
      if (newStatus === EnumPaymentStatus.SETTLEMENT) {
        const koneksiData = await KoneksiData.findById(rab.idKoneksiData);
        if (koneksiData) {
          await Notifikasi.create({
            IdPelanggan: koneksiData.IdPelanggan,
            Judul: "Pembayaran RAB Berhasil",
            Pesan: `Pembayaran biaya pemasangan sebesar Rp ${rab.totalBiaya?.toLocaleString("id-ID")} berhasil. Teknisi akan segera melakukan instalasi.`,
            Kategori: EnumNotifikasiKategori.PEMBAYARAN,
            Link: null,
          });
        }
      }

      return {
        success: true,
        message: `Status pembayaran RAB diperbarui: ${newStatus}`,
        data: rab,
      };
    } catch (error: any) {
      console.error("RABService.handleRABNotification error:", error);
      return {
        success: false,
        message: `Gagal memproses notifikasi RAB: ${error.message}`,
        data: null,
      };
    }
  }
}
