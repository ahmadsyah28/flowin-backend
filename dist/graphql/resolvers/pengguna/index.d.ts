import { GraphQLContext, UpdateProfileInput } from "@/types";
export declare const penggunaResolvers: {
    Query: {
        me: (_: unknown, __: unknown, context: GraphQLContext) => Promise<{
            id: string;
            email: string;
            noHP: string;
            namaLengkap: string;
            isVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
        }>;
        penggunaById: (_: unknown, { id }: {
            id: string;
        }) => Promise<{
            id: string;
            email: string;
            noHP: string;
            namaLengkap: string;
            isVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
        }>;
    };
    Mutation: {
        updateProfile: (_: unknown, { input }: {
            input: UpdateProfileInput;
        }, context: GraphQLContext) => Promise<{
            id: string;
            email: string;
            noHP: string;
            namaLengkap: string;
            isVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
        }>;
        changePassword: (_: unknown, { oldPassword, newPassword, }: {
            oldPassword: string;
            newPassword: string;
        }, context: GraphQLContext) => Promise<boolean>;
    };
};
export default penggunaResolvers;
//# sourceMappingURL=index.d.ts.map