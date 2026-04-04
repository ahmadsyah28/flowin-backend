import { GraphQLContext } from "../../types";
import { RegisterInput, LoginInput, GoogleLoginInput, UpdateProfileInput, UpdatePasswordInput, CompleteGoogleProfileInput } from "../../services/PenggunaService";
export declare const penggunaResolvers: {
    Query: {
        me: (_: any, __: any, context: GraphQLContext) => Promise<import("../../models").IPengguna>;
    };
    Mutation: {
        register: (_: any, { input }: {
            input: RegisterInput;
        }) => Promise<import("../../services/PenggunaService").AuthResponse>;
        registerWithGoogle: (_: any, { idToken }: {
            idToken: string;
        }) => Promise<import("../../services/PenggunaService").AuthResponse>;
        login: (_: any, { input }: {
            input: LoginInput;
        }) => Promise<import("../../services/PenggunaService").AuthResponse>;
        googleLogin: (_: any, { input }: {
            input: GoogleLoginInput;
        }) => Promise<import("../../services/PenggunaService").AuthResponse>;
        logout: (_: any, __: any, context: GraphQLContext) => Promise<import("../../services/PenggunaService").MutationResponse>;
        updateProfile: (_: any, { input }: {
            input: UpdateProfileInput;
        }, context: GraphQLContext) => Promise<import("../../services/PenggunaService").MutationResponse>;
        updatePassword: (_: any, { input }: {
            input: UpdatePasswordInput;
        }, context: GraphQLContext) => Promise<import("../../services/PenggunaService").MutationResponse>;
        completeGoogleProfile: (_: any, { input }: {
            input: CompleteGoogleProfileInput;
        }, context: GraphQLContext) => Promise<import("../../services/PenggunaService").MutationResponse>;
        verifyEmail: (_: any, { token }: {
            token: string;
        }) => Promise<import("../../services/PenggunaService").MutationResponse>;
        resendVerificationEmail: (_: any, __: any, context: GraphQLContext) => Promise<import("../../services/PenggunaService").MutationResponse>;
    };
};
//# sourceMappingURL=Pengguna.d.ts.map