import { GraphQLContext } from "../../types";
import { RegisterInput, LoginInput, GoogleLoginInput, VerifyOTPInput, ResendOTPInput, UpdateProfileInput, UpdatePasswordInput } from "../../services/PenggunaService";
export declare const penggunaResolvers: {
    Query: {
        me: (_: any, __: any, context: GraphQLContext) => Promise<import("../../models").IPengguna>;
    };
    Mutation: {
        register: (_: any, { input }: {
            input: RegisterInput;
        }) => Promise<import("../../services/PenggunaService").AuthResponse>;
        login: (_: any, { input }: {
            input: LoginInput;
        }) => Promise<import("../../services/PenggunaService").AuthResponse>;
        googleLogin: (_: any, { input }: {
            input: GoogleLoginInput;
        }) => Promise<import("../../services/PenggunaService").AuthResponse>;
        verifyOTP: (_: any, { input }: {
            input: VerifyOTPInput;
        }) => Promise<import("../../services/PenggunaService").AuthResponse>;
        resendOTP: (_: any, { input }: {
            input: ResendOTPInput;
        }) => Promise<import("../../services/PenggunaService").MutationResponse>;
        logout: (_: any, __: any, context: GraphQLContext) => Promise<import("../../services/PenggunaService").MutationResponse>;
        updateProfile: (_: any, { input }: {
            input: UpdateProfileInput;
        }, context: GraphQLContext) => Promise<import("../../services/PenggunaService").MutationResponse>;
        updatePassword: (_: any, { input }: {
            input: UpdatePasswordInput;
        }, context: GraphQLContext) => Promise<import("../../services/PenggunaService").MutationResponse>;
    };
};
//# sourceMappingURL=Pengguna.d.ts.map