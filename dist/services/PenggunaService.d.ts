import { IPengguna } from "@/models/Pengguna";
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
export interface GoogleLoginInput {
    googleToken: string;
}
export interface UpdateProfileInput {
    namaLengkap?: string;
    noHP?: string;
}
export interface CompleteGoogleProfileInput {
    noHP: string;
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
    static login(input: LoginInput): Promise<AuthResponse>;
    static googleLogin(input: GoogleLoginInput): Promise<AuthResponse>;
    static registerWithGoogle(idToken: string): Promise<AuthResponse>;
    static logout(userId: string): Promise<MutationResponse>;
    static updateProfile(userId: string, input: UpdateProfileInput): Promise<MutationResponse>;
    static updatePassword(user: IPengguna, input: UpdatePasswordInput): Promise<MutationResponse>;
    static verifyEmail(token: string): Promise<MutationResponse>;
    static resendVerificationEmail(user: IPengguna): Promise<MutationResponse>;
    static completeGoogleProfile(userId: string, input: CompleteGoogleProfileInput): Promise<MutationResponse>;
}
//# sourceMappingURL=PenggunaService.d.ts.map