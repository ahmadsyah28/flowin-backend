"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PembayaranService_1 = require("../services/PembayaranService");
const webhookRouter = (0, express_1.Router)();
webhookRouter.post("/midtrans", async (req, res) => {
    try {
        console.log("📩 Midtrans webhook received:", {
            order_id: req.body?.order_id,
            transaction_status: req.body?.transaction_status,
            payment_type: req.body?.payment_type,
        });
        const result = await PembayaranService_1.PembayaranService.handleMidtransNotification(req.body);
        if (result.success) {
            console.log(`✅ Webhook processed: ${req.body?.order_id} → ${result.message}`);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        }
        else {
            console.error(`❌ Webhook failed: ${req.body?.order_id} → ${result.message}`);
            res.status(400).json({
                success: false,
                message: result.message,
            });
        }
    }
    catch (error) {
        console.error("❌ Webhook error:", error.message);
        res.status(200).json({
            success: false,
            message: "Internal server error",
        });
    }
});
exports.default = webhookRouter;
//# sourceMappingURL=midtransWebhook.js.map