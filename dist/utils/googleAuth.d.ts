export interface GoogleUserInfo {
    sub: string;
    name: string;
    email: string;
    picture?: string;
    email_verified: boolean;
}
export declare const verifyGoogleToken: (token: string) => Promise<GoogleUserInfo>;
//# sourceMappingURL=googleAuth.d.ts.map