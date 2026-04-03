"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authResolvers = void 0;
const graphql_1 = require("../../../graphql");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../../../models");
exports.authResolvers = {
    Mutation: {
        register: async (_, { input }) => {
            try {
                const existingPengguna = await models_1.Pengguna.findOne({ email: input.email });
                if (existingPengguna) {
                    throw new graphql_1.GraphQLError("Email sudah terdaftar");
                }
                const existingPhone = await models_1.Pengguna.findOne({ noHP: input.noHP });
                if (existingPhone) {
                    throw new graphql_1.GraphQLError("Nomor HP sudah terdaftar");
                }
                const pengguna = new models_1.Pengguna(input);
                await pengguna.save();
                const token = jsonwebtoken_1.default.sign({ penggunaId: pengguna._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
                return {
                    token,
                    pengguna: {
                        id: pengguna._id.toString(),
                        email: pengguna.email,
                        noHP: pengguna.noHP,
                        namaLengkap: pengguna.namaLengkap,
                        isVerified: pengguna.isVerified,
                        createdAt: pengguna.createdAt,
                        updatedAt: pengguna.updatedAt,
                    },
                };
            }
            catch (error) {
                if (error instanceof graphql_1.GraphQLError)
                    throw error;
                throw new graphql_1.GraphQLError("Registration failed: " + error.message);
            }
        },
        login: async (_, { email, password }) => {
            try {
                const pengguna = await models_1.Pengguna.findOne({ email });
                if (!pengguna) {
                    throw new graphql_1.GraphQLError("Email atau password salah");
                }
                const isValidPassword = await pengguna.comparePassword(password);
                if (!isValidPassword) {
                    throw new graphql_1.GraphQLError("Email atau password salah");
                }
                const token = jsonwebtoken_1.default.sign({ penggunaId: pengguna._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
                return {
                    token,
                    pengguna: {
                        id: pengguna._id.toString(),
                        email: pengguna.email,
                        noHP: pengguna.noHP,
                        namaLengkap: pengguna.namaLengkap,
                        isVerified: pengguna.isVerified,
                        createdAt: pengguna.createdAt,
                        updatedAt: pengguna.updatedAt,
                    },
                };
            }
            catch (error) {
                if (error instanceof graphql_1.GraphQLError)
                    throw error;
                throw new graphql_1.GraphQLError("Login failed: " + error.message);
            }
        },
    },
    Query: {
        hello: () => "Hello World from FLOWIN GraphQL 🚀",
        dbStatus: () => "Database connected successfully ✅",
    },
};
exports.default = exports.authResolvers;
//# sourceMappingURL=index.js.map