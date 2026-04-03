import mongoose from "mongoose";
import { IBaseDocument } from "./BaseModel";
export interface IPengguna extends IBaseDocument {
    email: string;
    noHP: string;
    namaLengkap: string;
    password?: string;
    token?: string;
    isVerified: boolean;
    googleId?: string;
    profilePicture?: string;
    authProvider: "email" | "google";
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export declare const Pengguna: mongoose.Model<IPengguna, {}, {}, {}, mongoose.Document<unknown, {}, IPengguna, {}, mongoose.DefaultSchemaOptions> & IPengguna & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IPengguna>;
//# sourceMappingURL=Pengguna.d.ts.map