import mongoose, { Document, Types } from "mongoose";
import { EnumPaymentStatus } from "@/enums";
export interface IRAB {
    idKoneksiData: Types.ObjectId;
    totalBiaya?: number | null;
    statusPembayaran: EnumPaymentStatus;
    orderId?: string | null;
    paymentUrl?: string | null;
    urlRab?: string | null;
    catatan?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface IRABDocument extends IRAB, Document {
}
export declare const RAB: mongoose.Model<IRABDocument, {}, {}, {}, mongoose.Document<unknown, {}, IRABDocument, {}, mongoose.DefaultSchemaOptions> & IRABDocument & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IRABDocument>;
//# sourceMappingURL=RAB.d.ts.map