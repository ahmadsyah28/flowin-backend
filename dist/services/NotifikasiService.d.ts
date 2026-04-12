import { Types } from "mongoose";
import { INotifikasi } from "@/models/Notifikasi";
import { EnumNotifikasiKategori } from "@/enums";
export interface NotifikasiFilterInput {
    kategori?: EnumNotifikasiKategori;
}
export interface NotifikasiResponse {
    success: boolean;
    message: string;
    data: INotifikasi | null;
}
export interface NotifikasiListResponse {
    success: boolean;
    message: string;
    data: INotifikasi[] | null;
    total?: number;
    unreadCount?: number;
}
export declare class NotifikasiService {
    static getNotifikasiList(userId: string | Types.ObjectId, filter?: NotifikasiFilterInput): Promise<NotifikasiListResponse>;
    static getNotifikasiById(id: string | Types.ObjectId): Promise<NotifikasiResponse>;
}
//# sourceMappingURL=NotifikasiService.d.ts.map