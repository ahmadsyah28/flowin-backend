import { IPengguna } from "@/models/Pengguna";
export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    type: string;
}
export declare const generateToken: (pengguna: IPengguna) => string;
export declare const verifyToken: (token: string) => JWTPayload;
export declare const generateVerificationToken: () => string;
export declare const verifyEmailToken: (token: string) => boolean;
//# sourceMappingURL=auth.d.ts.map