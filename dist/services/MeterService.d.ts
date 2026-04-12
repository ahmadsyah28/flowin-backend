import { Types } from "mongoose";
import { IMeter } from "@/models/Meter";
export interface MeterResponse {
    success: boolean;
    message: string;
    data: IMeter | null;
}
export interface MeterListResponse {
    success: boolean;
    message: string;
    data: IMeter[] | null;
    total?: number;
}
export declare class MeterService {
    static getMeterList(userId: string | Types.ObjectId): Promise<MeterListResponse>;
    static getMeterById(id: string | Types.ObjectId): Promise<MeterResponse>;
    static getMeterByNomor(nomorMeteran: string): Promise<MeterResponse>;
}
//# sourceMappingURL=MeterService.d.ts.map