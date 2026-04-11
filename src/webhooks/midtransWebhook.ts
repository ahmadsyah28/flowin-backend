import { Router, Request, Response } from "express";
import { PembayaranService } from "@/services/PembayaranService";
import { RABService } from "@/services/RABService";

const webhookRouter = Router();

/**
 * POST /api/webhook/midtrans
 *
 * Endpoint untuk menerima notifikasi dari Midtrans
 * Midtrans akan mengirim callback ke URL ini setelah user melakukan pembayaran
 *
 * Flow:
 * 1. User bayar di Midtrans Snap
 * 2. Midtrans kirim notifikasi ke endpoint ini
 * 3. Cek prefix order_id: "RAB-" → RABService, lainnya → PembayaranService
 * 4. Verifikasi & update status pembayaran
 * 5. Kirim notifikasi ke user
 */
webhookRouter.post(
  "/midtrans",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const orderId = req.body?.order_id || "";
      const isRABPayment = orderId.startsWith("RAB-");

      console.log(
        `📩 Midtrans webhook received [${isRABPayment ? "RAB" : "TAGIHAN"}]:`,
        {
          order_id: orderId,
          transaction_status: req.body?.transaction_status,
          payment_type: req.body?.payment_type,
        },
      );

      let result;
      if (isRABPayment) {
        result = await RABService.handleRABNotification(req.body);
      } else {
        result = await PembayaranService.handleMidtransNotification(req.body);
      }

      if (result.success) {
        console.log(
          `✅ Webhook processed: ${req.body?.order_id} → ${result.message}`,
        );
        res.status(200).json({
          success: true,
          message: result.message,
        });
      } else {
        console.error(
          `❌ Webhook failed: ${req.body?.order_id} → ${result.message}`,
        );
        res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error: any) {
      console.error("❌ Webhook error:", error.message);
      // Midtrans expects 200 response, otherwise it will retry
      // Return 200 even on error to prevent retry spam
      res.status(200).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
);

export default webhookRouter;
