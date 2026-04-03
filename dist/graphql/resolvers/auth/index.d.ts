import { RegisterInput } from "@/types";
export declare const authResolvers: {
    Mutation: {
        register: (_: unknown, { input }: {
            input: RegisterInput;
        }) => Promise<{
            token: string;
            pengguna: {
                id: string;
                email: string;
                noHP: string;
                namaLengkap: string;
                isVerified: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        }>;
        login: (_: unknown, { email, password }: {
            email: string;
            password: string;
        }) => Promise<{
            token: string;
            pengguna: {
                id: string;
                email: string;
                noHP: string;
                namaLengkap: string;
                isVerified: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        }>;
    };
    Query: {
        hello: () => string;
        dbStatus: () => string;
    };
};
export default authResolvers;
//# sourceMappingURL=index.d.ts.map