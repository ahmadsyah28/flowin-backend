import midtransClient from "midtrans-client";
import { Types } from "mongoose";
import { Tagihan, ITagihan } from "@/models/Tagihan";
import { Meter } from "@/models/Meter";
import { KoneksiData } from "@/models/KoneksiData";
import { Pengguna } from "@/models/Pengguna";
import { Notifikasi } from "@/models/Notifikasi";
import { EnumPaymentStatus, EnumNotifikasiKategori } from "@/enums";

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

// Input interfaces
export interface TagihanFilterInput {
  idMeteran?: string;
  periode?: string;
  statusPembayaran?: EnumPaymentStatus;
  menunggak?: boolean;
}

// Response interfaces
export interface TagihanResponse {
  success: boolean;
  message: string;
  data: ITagihan | null;
}

export interface TagihanListResponse {
  success: boolean;
  message: string;
  data: ITagihan[] | null;
  total?: number;
}

export interface CreatePaymentResponse {
  success: boolean;
  message: string;
  data: {
    snapToken: string;
    snapRedirectUrl: string;
    midtransOrderId: string;
    jumlahBayar: number;
  } | null;
}

export interface MidtransNotification {
  transaction_status: string;
  transaction_id: string;
  order_id: string;
  payment_type: string;
  fraud_status?: string;
}

export class TagihanService {
  /**
   * Helper to get all meter IDs for a user
   */
  private static async getUserMeterIds(
    userId: string | Types.ObjectId,
  ): Promise<Types.ObjectId[]> {
    const koneksiData = await KoneksiData.findOne({ IdPelanggan: userId });
    if (!koneksiData) return [];

    const meters = await Meter.find({ IdKoneksiData: koneksiData._id });
    return meters.map((m) => m._id as Types.ObjectId);
  }

  /**
   * Get all tagihan for a user with optional filter
   */
  static async getTagihanList(
    userId: string | Types.ObjectId,
    filter?: TagihanFilterInput,
  ): Promise<TagihanListResponse> {
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

      const query: any = {
        IdMeteran: { $in: meterIds },
        StatusPembayaran: { $in: Object.values(EnumPaymentStatus) },
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

      const tagihanList = await Tagihan.find(query)
        .populate("IdMeteran")
        .sort({ createdAt: -1 });

      return {
        success: true,
        message: "Berhasil mendapatkan daftar tagihan",
        data: tagihanList,
        total: tagihanList.length,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal mendapatkan daftar tagihan",
        data: null,
        total: 0,
      };
    }
  }

  /**
   * Get tagihan by ID
   */
  static async getTagihanById(
    id: string | Types.ObjectId,
  ): Promise<TagihanResponse> {
    try {
      const tagihan = await Tagihan.findById(id).populate("IdMeteran");

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
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal mendapatkan tagihan",
        data: null,
      };
    }
  }

  /**
   * Get active tagihan (unpaid)
   */
  static async getTagihanAktif(
    userId: string | Types.ObjectId,
  ): Promise<TagihanResponse> {
    try {
      const meterIds = await this.getUserMeterIds(userId);

      if (meterIds.length === 0) {
        return {
          success: false,
          message: "Tidak ada meteran terdaftar",
          data: null,
        };
      }

      const tagihan = await Tagihan.findOne({
        IdMeteran: { $in: meterIds },
        StatusPembayaran: EnumPaymentStatus.PENDING,
      })
        .populate("IdMeteran")
        .sort({ TenggatWaktu: 1 }); // Get the one with earliest due date

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
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal mendapatkan tagihan aktif",
        data: null,
      };
    }
  }

  /**
   * Get tagihan history (paid)
   */
  static async getTagihanRiwayat(
    userId: string | Types.ObjectId,
  ): Promise<TagihanListResponse> {
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

      const tagihanList = await Tagihan.find({
        IdMeteran: { $in: meterIds },
        StatusPembayaran: EnumPaymentStatus.SETTLEMENT,
      })
        .populate("IdMeteran")
        .sort({ TanggalPembayaran: -1 });

      return {
        success: true,
        message: "Berhasil mendapatkan riwayat tagihan",
        data: tagihanList,
        total: tagihanList.length,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal mendapatkan riwayat tagihan",
        data: null,
        total: 0,
      };
    }
  }

  /**
   * Pay tagihan
   */
  static async bayarTagihan(
    id: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    metodePembayaran: string,
  ): Promise<TagihanResponse> {
    try {
      const meterIds = await this.getUserMeterIds(userId);

      const tagihan = await Tagihan.findOne({
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

      if (tagihan.StatusPembayaran === EnumPaymentStatus.SETTLEMENT) {
        return {
          success: false,
          message: "Tagihan sudah dibayar",
          data: null,
        };
      }

      // Update tagihan status
      const updatedTagihan = await Tagihan.findByIdAndUpdate(
        id,
        {
          StatusPembayaran: EnumPaymentStatus.SETTLEMENT,
          TanggalPembayaran: new Date(),
          MetodePembayaran: metodePembayaran,
        },
        { new: true },
      ).populate("IdMeteran");

      return {
        success: true,
        message: "Berhasil membayar tagihan",
        data: updatedTagihan,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal membayar tagihan",
        data: null,
      };
    }
  }

  /**
   * Generate unique order ID: FLOWIN-{timestamp}-{random}
   */
  private static generateOrderId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `FLOWIN-${timestamp}-${random}`;
  }

  /**
   * Buat pembayaran via Midtrans Snap untuk SEMUA tagihan belum bayar user.
   * Seluruh tagihan pending/expire digabung dalam satu transaksi Midtrans,
   * dan masing-masing tagihan mendapat MidtransOrderId & SnapRedirectUrl yang sama.
   */
  static async createPayment(
    userId: string | Types.ObjectId,
  ): Promise<CreatePaymentResponse> {
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

      // 2. Ambil semua tagihan belum bayar milik user
      const meterIds = await this.getUserMeterIds(userId);
      if (meterIds.length === 0) {
        return {
          success: false,
          message: "Tidak ada meteran terdaftar",
          data: null,
        };
      }

      const tagihanList = await Tagihan.find({
        IdMeteran: { $in: meterIds },
        StatusPembayaran: {
          $in: [EnumPaymentStatus.PENDING, EnumPaymentStatus.EXPIRE],
        },
      }).sort({ TenggatWaktu: 1 });

      if (tagihanList.length === 0) {
        return {
          success: false,
          message: "Tidak ada tagihan yang belum dibayar",
          data: null,
        };
      }

      // 3. Jika semua tagihan sudah punya orderId yang sama → kembalikan yang lama
      const firstOrderId = tagihanList[0].MidtransOrderId;
      const firstRedirectUrl = tagihanList[0].SnapRedirectUrl;
      const allSameOrder =
        firstOrderId &&
        firstRedirectUrl &&
        tagihanList.every((t) => t.MidtransOrderId === firstOrderId);

      if (allSameOrder) {
        const totalBayar = tagihanList.reduce(
          (sum, t) => sum + t.TotalBiaya,
          0,
        );
        return {
          success: true,
          message: "Pembayaran sudah dibuat sebelumnya, silakan lanjutkan",
          data: {
            snapToken: firstOrderId!,
            snapRedirectUrl: firstRedirectUrl!,
            midtransOrderId: firstOrderId!,
            jumlahBayar: totalBayar,
          },
        };
      }

      // 4. Bangun item_details dari semua tagihan
      const orderId = this.generateOrderId();
      const itemDetails: any[] = [];

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
      }

      const grossAmount = itemDetails.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0,
      );

      // 5. Buat satu transaksi di Midtrans
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
      } as any);

      // 6. Simpan orderId & redirectUrl yang SAMA ke semua tagihan
      const tagihanIds = tagihanList.map((t) => t._id);
      await Tagihan.updateMany(
        { _id: { $in: tagihanIds } },
        {
          MidtransOrderId: orderId,
          SnapRedirectUrl: midtransResponse.redirect_url,
        },
      );

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
    } catch (error: any) {
      console.error("TagihanService.createPayment error:", error);
      return {
        success: false,
        message: `Gagal membuat pembayaran: ${error.message}`,
        data: null,
      };
    }
  }

  /**
   * Map status string dari Midtrans ke EnumPaymentStatus
   */
  private static mapMidtransStatus(
    transactionStatus: string,
    fraudStatus?: string,
  ): EnumPaymentStatus {
    if (transactionStatus === "capture") {
      return fraudStatus === "accept"
        ? EnumPaymentStatus.SETTLEMENT
        : EnumPaymentStatus.PENDING;
    }
    if (transactionStatus === "settlement") return EnumPaymentStatus.SETTLEMENT;
    if (transactionStatus === "cancel" || transactionStatus === "deny")
      return EnumPaymentStatus.CANCEL;
    if (transactionStatus === "expire") return EnumPaymentStatus.EXPIRE;
    return EnumPaymentStatus.PENDING;
  }

  /**
   * Handle webhook notification dari Midtrans untuk pembayaran tagihan
   */
  static async handleMidtransNotification(
    notificationBody: any,
  ): Promise<{ success: boolean; message: string }> {
    try {
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

      // Cari SEMUA tagihan dengan MidtransOrderId ini
      const tagihanList = await Tagihan.find({ MidtransOrderId: order_id });
      if (tagihanList.length === 0) {
        return {
          success: false,
          message: `Tagihan dengan order ID ${order_id} tidak ditemukan`,
        };
      }

      const newStatus = this.mapMidtransStatus(
        transaction_status,
        fraud_status,
      );

      // Update semua tagihan dengan status yang sama
      for (const tagihan of tagihanList) {
        tagihan.StatusPembayaran = newStatus;

        if (newStatus === EnumPaymentStatus.SETTLEMENT) {
          tagihan.TanggalPembayaran = new Date();
          tagihan.MetodePembayaran = payment_type;
        }

        await tagihan.save();
      }

      // Kirim notifikasi sekali (berdasarkan tagihan pertama)
      if (newStatus === EnumPaymentStatus.SETTLEMENT) {
        const firstTagihan = tagihanList[0];
        const meter = await Meter.findById(firstTagihan.IdMeteran);
        const koneksiData = meter
          ? await KoneksiData.findById(meter.IdKoneksiData)
          : null;
        if (koneksiData) {
          const totalBayar = tagihanList.reduce(
            (sum, t) => sum + t.TotalBiaya,
            0,
          );
          const periodeList = tagihanList.map((t) => t.Periode).join(", ");
          await Notifikasi.create({
            IdPelanggan: koneksiData.IdPelanggan,
            Judul: "Pembayaran Berhasil",
            Pesan: `Pembayaran tagihan periode ${periodeList} sebesar Rp ${totalBayar.toLocaleString("id-ID")} telah berhasil.`,
            Kategori: EnumNotifikasiKategori.PEMBAYARAN,
            isRead: false,
          });
        }
      }

      return {
        success: true,
        message: `Tagihan ${order_id} diupdate ke status ${newStatus}`,
      };
    } catch (error: any) {
      console.error("TagihanService.handleMidtransNotification error:", error);
      return {
        success: false,
        message: `Gagal memproses notifikasi: ${error.message}`,
      };
    }
  }
}
