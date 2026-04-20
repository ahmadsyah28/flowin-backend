import { IPengguna } from "../models/Pengguna";
export interface RegisterInput {
    email: string;
    noHP: string;
    namaLengkap: string;
    password: string;
}
export interface LoginInput {
    email: string;
    password: string;
}
export interface VerifyOTPInput {
    email: string;
    otp: string;
}
export interface ResendOTPInput {
    email: string;
}
export interface GoogleLoginInput {
    idToken: string;
}
export interface UpdateProfileInput {
    namaLengkap?: string;
    noHP?: string;
}
export interface UpdatePasswordInput {
    currentPassword?: string;
    newPassword: string;
}
export interface AuthResponse {
    success: boolean;
    message: string;
    token: string | null;
    user: any | null;
}
export interface MutationResponse {
    success: boolean;
    message: string;
    data: any | null;
}
export declare class PenggunaService {
    static register(input: RegisterInput): Promise<AuthResponse>;
    static verifyOTP(input: VerifyOTPInput): Promise<AuthResponse>;
    static resendOTP(input: ResendOTPInput): Promise<MutationResponse>;
    static login(input: LoginInput): Promise<AuthResponse>;
    static googleLogin(input: GoogleLoginInput): Promise<AuthResponse>;
    static logout(userId: string): Promise<MutationResponse>;
    static updateProfile(userId: string, input: UpdateProfileInput): Promise<MutationResponse>;
    static updatePassword(user: IPengguna, input: UpdatePasswordInput): Promise<MutationResponse>;
}
//# sourceMappingURL=PenggunaService.d.ts.map