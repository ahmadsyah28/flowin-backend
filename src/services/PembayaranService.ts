import midtransClient from "midtrans-client";
import { Types } from "mongoose";
import { Tagihan, ITagihan } from "@/models/Tagihan";
import { Pengguna, IPengguna } from "@/models/Pengguna";
import {
  Pembayaran,
  IPembayaran,
  EnumStatusPembayaran,
} from "@/models/Pembayaran";
import { Notifikasi } from "@/models/Notifikasi";
import { Meter } from "@/models/Meter";
import { KoneksiData } from "@/models/KoneksiData";
import { EnumPaymentStatus, EnumNotifikasiKategori } from "@/enums";

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

export interface MidtransSnapResponse {
  token: string;
  redirect_url: string;
}

export interface MidtransNotification {
  transaction_time: string;
  transaction_status: string;
  transaction_id: string;
  status_message: string;
  status_code: string;
  signature_key: string;
  payment_type: string;
  order_id: string;
  merchant_id: string;
  gross_amount: string;
  fraud_status?: string;
  currency: string;
}

export interface CreatePaymentResponse {
  success: boolean;
  message: string;
  data: {
    pembayaran: IPembayaran;
    snapToken: string;
    snapRedirectUrl: string;
  } | null;
}

export interface PembayaranResponse {
  success: boolean;
  message: string;
  data: IPembayaran | null;
}

export interface PembayaranListResponse {
  success: boolean;
  message: string;
  data: IPembayaran[] | null;
  total?: number;
}

// ============================================================
// Service Class
// ============================================================

export class PembayaranService {
  /**
   * Generate unique order ID: FLOWIN-{timestamp}-{random}
   */
  private static generateOrderId(tagihanId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `FLOWIN-${timestamp}-${random}`;
  }

  /**
   * Helper to get pengguna from userId
   */
  private static async getPengguna(
    userId: string | Types.ObjectId,
  ): Promise<IPengguna | null> {
    return Pengguna.findById(userId);
  }

  /**
   * Helper to verify tagihan belongs to user
   */
  private static async verifyTagihanOwnership(
    tagihanId: string,
    userId: string | Types.ObjectId,
  ): Promise<ITagihan | null> {
    const tagihan = await Tagihan.findById(tagihanId);
    if (!tagihan) return null;

    // Check if the meter belongs to the user
    const meter = await Meter.findById(tagihan.IdMeteran);
    if (!meter) return null;

    const koneksiData = await KoneksiData.findById(meter.IdKoneksiData);
    if (!koneksiData) return null;

    if (koneksiData.IdPelanggan.toString() !== userId.toString()) {
      return null;
    }

    return tagihan;
  }

  // ============================================================
  // Create Payment (Buat Transaksi Midtrans)
  // ============================================================

  /**
   * Membuat pembayaran baru via Midtrans Snap
   * Flow: User klik bayar → createPayment → dapat snapToken → buka Midtrans Snap
   */
  static async createPayment(
    tagihanId: string,
    userId: string | Types.ObjectId,
  ): Promise<CreatePaymentResponse> {
    try {
      // 1. Validasi pengguna
      const pengguna = await this.getPengguna(userId);
      if (!pengguna) {
        return {
          success: false,
          message: "Pengguna tidak ditemukan",
          data: null,
        };
      }

      // 2. Validasi tagihan & kepemilikan
      const tagihan = await this.verifyTagihanOwnership(tagihanId, userId);
      if (!tagihan) {
        return {
          success: false,
          message: "Tagihan tidak ditemukan atau bukan milik Anda",
          data: null,
        };
      }

      // 3. Cek apakah tagihan sudah lunas
      if (tagihan.StatusPembayaran === EnumPaymentStatus.SETTLEMENT) {
        return {
          success: false,
          message: "Tagihan ini sudah lunas",
          data: null,
        };
      }

      // 4. Cek apakah sudah ada pembayaran PENDING untuk tagihan ini
      const existingPending = await Pembayaran.findOne({
        IdTagihan: tagihan._id,
        StatusPembayaran: EnumStatusPembayaran.PENDING,
      });

      if (existingPending) {
        // Return snap token yang sudah ada (masih valid)
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

      // 5. Generate order ID unik
      const orderId = this.generateOrderId(tagihanId);

      // 6. Buat transaksi di Midtrans
      const itemDetails: any[] = [
        {
          id: tagihan._id.toString(),
          price: Math.round(tagihan.Biaya),
          quantity: 1,
          name: `Tagihan Air - ${tagihan.Periode}`,
        },
      ];

      // Tambahkan denda jika ada
      if (tagihan.Denda && tagihan.Denda > 0) {
        itemDetails.push({
          id: `denda-${tagihan._id.toString()}`,
          price: Math.round(tagihan.Denda),
          quantity: 1,
          name: `Denda Keterlambatan - ${tagihan.Periode}`,
        });
      }

      // Tambahkan biaya beban (selisih TotalBiaya - Biaya - Denda)
      const biayaBeban = Math.round(
        tagihan.TotalBiaya - tagihan.Biaya - (tagihan.Denda || 0),
      );
      if (biayaBeban > 0) {
        itemDetails.push({
          id: `beban-${tagihan._id.toString()}`,
          price: biayaBeban,
          quantity: 1,
          name: `Biaya Beban - ${tagihan.Periode}`,
        });
      }

      // Hitung gross_amount dari jumlah item_details agar selalu cocok
      const grossAmount = itemDetails.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0,
      );

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

      const midtransResponse: MidtransSnapResponse =
        await snap.createTransaction(midtransParameter);

      // 7. Simpan pembayaran ke database
      const pembayaran = new Pembayaran({
        IdTagihan: tagihan._id,
        IdPengguna: userId,
        MidtransOrderId: orderId,
        SnapToken: midtransResponse.token,
        SnapRedirectUrl: midtransResponse.redirect_url,
        JumlahBayar: tagihan.TotalBiaya,
        StatusPembayaran: EnumStatusPembayaran.PENDING,
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
    } catch (error: any) {
      console.error("PembayaranService.createPayment error:", error);
      return {
        success: false,
        message: `Gagal membuat pembayaran: ${error.message}`,
        data: null,
      };
    }
  }

  // ============================================================
  // Handle Webhook Notification dari Midtrans
  // ============================================================

  /**
   * Proses notifikasi webhook dari Midtrans
   * Dipanggil saat Midtrans mengirim callback setelah user bayar
   */
  static async handleMidtransNotification(
    notificationBody: any,
  ): Promise<PembayaranResponse> {
    try {
      // 1. Verifikasi notifikasi dari Midtrans
      const statusResponse: MidtransNotification = await (
        coreApi as any
      ).transaction.notification(notificationBody);

      const {
        order_id,
        transaction_status,
        fraud_status,
        transaction_id,
        payment_type,
      } = statusResponse;

      // 2. Cari pembayaran berdasarkan order ID
      const pembayaran = await Pembayaran.findOne({
        MidtransOrderId: order_id,
      });
      if (!pembayaran) {
        return {
          success: false,
          message: `Pembayaran dengan order ID ${order_id} tidak ditemukan`,
          data: null,
        };
      }

      // 3. Map status Midtrans ke status internal
      const newStatus = this.mapMidtransStatus(
        transaction_status,
        fraud_status,
      );

      // 4. Update pembayaran
      pembayaran.StatusPembayaran = newStatus;
      pembayaran.MidtransTransactionId = transaction_id;
      pembayaran.MetodePembayaran = payment_type;
      pembayaran.MidtransResponse = statusResponse;

      if (newStatus === EnumStatusPembayaran.SUKSES) {
        pembayaran.TanggalBayar = new Date();
      }

      await pembayaran.save();

      // 5. Update status tagihan jika pembayaran sukses
      if (newStatus === EnumStatusPembayaran.SUKSES) {
        await Tagihan.findByIdAndUpdate(pembayaran.IdTagihan, {
          StatusPembayaran: EnumPaymentStatus.SETTLEMENT,
          TanggalPembayaran: new Date(),
          MetodePembayaran: payment_type,
        });

        // 6. Kirim notifikasi ke user
        await this.createPaymentNotification(
          pembayaran.IdPengguna,
          pembayaran.IdTagihan,
          "SUKSES",
          pembayaran.JumlahBayar,
        );
      } else if (
        newStatus === EnumStatusPembayaran.GAGAL ||
        newStatus === EnumStatusPembayaran.EXPIRED
      ) {
        // Notifikasi pembayaran gagal/expired
        await this.createPaymentNotification(
          pembayaran.IdPengguna,
          pembayaran.IdTagihan,
          newStatus === EnumStatusPembayaran.GAGAL ? "GAGAL" : "EXPIRED",
          pembayaran.JumlahBayar,
        );
      }

      return {
        success: true,
        message: `Status pembayaran diperbarui: ${newStatus}`,
        data: pembayaran,
      };
    } catch (error: any) {
      console.error(
        "PembayaranService.handleMidtransNotification error:",
        error,
      );
      return {
        success: false,
        message: `Gagal memproses notifikasi: ${error.message}`,
        data: null,
      };
    }
  }

  // ============================================================
  // Cek Status Transaksi
  // ============================================================

  /**
   * Cek status transaksi langsung ke Midtrans API
   */
  static async checkTransactionStatus(
    orderId: string,
  ): Promise<PembayaranResponse> {
    try {
      const statusResponse = await (coreApi as any).transaction.status(orderId);

      const pembayaran = await Pembayaran.findOne({
        MidtransOrderId: orderId,
      });
      if (!pembayaran) {
        return {
          success: false,
          message: "Pembayaran tidak ditemukan",
          data: null,
        };
      }

      // Update status dari Midtrans
      const newStatus = this.mapMidtransStatus(
        statusResponse.transaction_status,
        statusResponse.fraud_status,
      );

      pembayaran.StatusPembayaran = newStatus;
      pembayaran.MidtransResponse = statusResponse;

      if (newStatus === EnumStatusPembayaran.SUKSES) {
        pembayaran.TanggalBayar = pembayaran.TanggalBayar ?? new Date();
        pembayaran.MetodePembayaran =
          statusResponse.payment_type ?? pembayaran.MetodePembayaran;
      }

      await pembayaran.save();

      // Sync status tagihan jika pembayaran sudah settlement
      if (newStatus === EnumStatusPembayaran.SUKSES) {
        await Tagihan.findByIdAndUpdate(pembayaran.IdTagihan, {
          StatusPembayaran: EnumPaymentStatus.SETTLEMENT,
          TanggalPembayaran: pembayaran.TanggalBayar,
          MetodePembayaran:
            statusResponse.payment_type ?? pembayaran.MetodePembayaran,
        });
      }

      return {
        success: true,
        message: `Status: ${newStatus}`,
        data: pembayaran,
      };
    } catch (error: any) {
      console.error("PembayaranService.checkTransactionStatus error:", error);
      return {
        success: false,
        message: `Gagal cek status transaksi: ${error.message}`,
        data: null,
      };
    }
  }

  // ============================================================
  // Query Methods
  // ============================================================

  /**
   * Get semua pembayaran milik user
   */
  static async getMyPembayaran(
    userId: string | Types.ObjectId,
    limit: number = 10,
    offset: number = 0,
  ): Promise<PembayaranListResponse> {
    try {
      const [data, total] = await Promise.all([
        Pembayaran.find({ IdPengguna: userId })
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit)
          .populate({
            path: "IdTagihan",
            select: "Periode TotalPemakaian TotalBiaya StatusPembayaran",
          }),
        Pembayaran.countDocuments({ IdPengguna: userId }),
      ]);

      return {
        success: true,
        message: "Berhasil mengambil riwayat pembayaran",
        data,
        total,
      };
    } catch (error: any) {
      console.error("PembayaranService.getMyPembayaran error:", error);
      return {
        success: false,
        message: `Gagal mengambil riwayat pembayaran: ${error.message}`,
        data: null,
        total: 0,
      };
    }
  }

  /**
   * Get detail 1 pembayaran
   */
  static async getPembayaranDetail(
    pembayaranId: string,
    userId: string | Types.ObjectId,
  ): Promise<PembayaranResponse> {
    try {
      const pembayaran = await Pembayaran.findOne({
        _id: pembayaranId,
        IdPengguna: userId,
      }).populate({
        path: "IdTagihan",
        select:
          "Periode PenggunaanSebelum PenggunaanSekarang TotalPemakaian Biaya Denda TotalBiaya StatusPembayaran TenggatWaktu",
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
    } catch (error: any) {
      console.error("PembayaranService.getPembayaranDetail error:", error);
      return {
        success: false,
        message: `Gagal mengambil detail pembayaran: ${error.message}`,
        data: null,
      };
    }
  }

  // ============================================================
  // Helper Methods
  // ============================================================

  /**
   * Mapping status Midtrans → status internal
   */
  private static mapMidtransStatus(
    transactionStatus: string,
    fraudStatus?: string,
  ): EnumStatusPembayaran {
    if (transactionStatus === "capture") {
      if (fraudStatus === "accept") return EnumStatusPembayaran.SUKSES;
      return EnumStatusPembayaran.PENDING;
    }

    switch (transactionStatus) {
      case "settlement":
        return EnumStatusPembayaran.SUKSES;
      case "pending":
        return EnumStatusPembayaran.PENDING;
      case "deny":
      case "cancel":
        return EnumStatusPembayaran.GAGAL;
      case "expire":
        return EnumStatusPembayaran.EXPIRED;
      case "refund":
      case "partial_refund":
        return EnumStatusPembayaran.REFUND;
      default:
        return EnumStatusPembayaran.PENDING;
    }
  }

  /**
   * Buat notifikasi pembayaran otomatis
   */
  private static async createPaymentNotification(
    userId: Types.ObjectId,
    tagihanId: Types.ObjectId,
    status: "SUKSES" | "GAGAL" | "EXPIRED",
    jumlah: number,
  ): Promise<void> {
    try {
      const jumlahFormatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(jumlah);

      let judul: string;
      let pesan: string;

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

      await Notifikasi.create({
        IdPelanggan: userId,
        Judul: judul,
        Pesan: pesan,
        Kategori: EnumNotifikasiKategori.PEMBAYARAN,
        Link: null,
      });
    } catch (error) {
      // Log error tapi jangan throw — notifikasi gagal tidak boleh
      // menggagalkan proses pembayaran utama
      console.error("Failed to create payment notification:", error);
    }
  }
}
