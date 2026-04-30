import { Types } from "mongoose";
import { ITagihan } from "../models/Tagihan";
import { EnumPaymentStatus } from "../enums";
export interface TagihanFilterInput {
    idMeteran?: string;
    periode?: string;
    statusPembayaran?: EnumPaymentStatus;
    menunggak?: boolean;
}
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
export declare class TagihanService {
    private static getUserMeterIds;
    static getTagihanList(userId: string | Types.ObjectId, filter?: TagihanFilterInput): Promise<TagihanListResponse>;
    static getTagihanById(id: string | Types.ObjectId): Promise<TagihanResponse>;
    static getTagihanAktif(userId: string | Types.ObjectId): Promise<TagihanResponse>;
    static getTagihanRiwayat(userId: string | Types.ObjectId): Promise<TagihanListResponse>;
    static bayarTagihan(id: string | Types.ObjectId, userId: string | Types.ObjectId, metodePembayaran: string): Promise<TagihanResponse>;
    private static generateOrderId;
    static createPayment(tagihanId: string, userId: string | Types.ObjectId): Promise<CreatePaymentResponse>;
    private static mapMidtransStatus;
    static handleMidtransNotification(notificationBody: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=TagihanService.d.ts.map