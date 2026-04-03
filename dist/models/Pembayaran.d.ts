import mongoose, { Types } from "mongoose";
import { IBaseDocument } from "./BaseModel";
export declare enum EnumStatusPembayaran {
    PENDING = "Pending",
    SUKSES = "Settlement",
    GAGAL = "Cancel",
    EXPIRED = "Expire",
    REFUND = "Refund"
}
export interface IPembayaran extends IBaseDocument {
    IdTagihan: Types.ObjectId;
    IdPengguna: Types.ObjectId;
    MidtransOrderId: string;
    MidtransTransactionId?: string;
    SnapToken: string;
    SnapRedirectUrl: string;
    MetodePembayaran?: string;
    JumlahBayar: number;
    StatusPembayaran: EnumStatusPembayaran;
    MidtransResponse?: Record<string, any>;
    TanggalBayar?: Date;
}
export declare const Pembayaran: mongoose.Model<IPembayaran, {}, {}, {}, mongoose.Document<unknown, {}, IPembayaran, {}, mongoose.DefaultSchemaOptions> & IPembayaran & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IPembayaran>;
//# sourceMappingURL=Pembayaran.d.ts.map