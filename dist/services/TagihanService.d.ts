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
export declare class TagihanService {
    private static getUserMeterIds;
    static getTagihanList(userId: string | Types.ObjectId, filter?: TagihanFilterInput): Promise<TagihanListResponse>;
    static getTagihanById(id: string | Types.ObjectId): Promise<TagihanResponse>;
    static getTagihanAktif(userId: string | Types.ObjectId): Promise<TagihanResponse>;
    static getTagihanRiwayat(userId: string | Types.ObjectId): Promise<TagihanListResponse>;
    static bayarTagihan(id: string | Types.ObjectId, userId: string | Types.ObjectId, metodePembayaran: string): Promise<TagihanResponse>;
}
//# sourceMappingURL=TagihanService.d.ts.map