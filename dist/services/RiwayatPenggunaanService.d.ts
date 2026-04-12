import { Types } from "mongoose";
import { IRiwayatPenggunaan } from "@/models/RiwayatPenggunaan";
export interface RiwayatPenggunaanListResponse {
    success: boolean;
    message: string;
    data: IRiwayatPenggunaan[] | null;
    total: number;
}
export declare class RiwayatPenggunaanService {
    static getRiwayatPenggunaan(meteranId: string | Types.ObjectId): Promise<RiwayatPenggunaanListResponse>;
}
//# sourceMappingURL=RiwayatPenggunaanService.d.ts.map