import { Types } from "mongoose";
import { IPembayaran } from "@/models/Pembayaran";
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
export declare class PembayaranService {
    private static generateOrderId;
    private static getPengguna;
    private static verifyTagihanOwnership;
    static createPayment(tagihanId: string, userId: string | Types.ObjectId): Promise<CreatePaymentResponse>;
    static handleMidtransNotification(notificationBody: any): Promise<PembayaranResponse>;
    static checkTransactionStatus(orderId: string): Promise<PembayaranResponse>;
    static getMyPembayaran(userId: string | Types.ObjectId, limit?: number, offset?: number): Promise<PembayaranListResponse>;
    static getPembayaranDetail(pembayaranId: string, userId: string | Types.ObjectId): Promise<PembayaranResponse>;
    private static mapMidtransStatus;
    private static createPaymentNotification;
}
//# sourceMappingURL=PembayaranService.d.ts.map