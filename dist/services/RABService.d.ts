import { Types } from "mongoose";
import { IRABDocument } from "../models/RAB";
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
export declare class RABService {
    static getRABByKoneksiData(userId: string | Types.ObjectId): Promise<RABResponse>;
    static createRABPayment(userId: string | Types.ObjectId): Promise<RABPaymentResponse>;
    static handleRABNotification(notificationBody: any): Promise<RABResponse>;
}
export {};
//# sourceMappingURL=RABService.d.ts.map