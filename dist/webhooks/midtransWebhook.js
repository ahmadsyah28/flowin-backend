"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PembayaranService_1 = require("../services/PembayaranService");
const RABService_1 = require("../services/RABService");
const webhookRouter = (0, express_1.Router)();
webhookRouter.post("/midtrans", async (req, res) => {
    try {
        const orderId = req.body?.order_id || "";
        const isRABPayment = orderId.startsWith("RAB-");
        console.log(`📩 Midtrans webhook received [${isRABPayment ? "RAB" : "TAGIHAN"}]:`, {
            order_id: orderId,
            transaction_status: req.body?.transaction_status,
            payment_type: req.body?.payment_type,
        });
        let result;
        if (isRABPayment) {
            result = await RABService_1.RABService.handleRABNotification(req.body);
        }
        else {
            result = await PembayaranService_1.PembayaranService.handleMidtransNotification(req.body);
        }
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