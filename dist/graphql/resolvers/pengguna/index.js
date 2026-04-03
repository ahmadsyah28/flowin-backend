"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.penggunaResolvers = void 0;
const graphql_1 = require("../../../graphql");
const models_1 = require("../../../models");
exports.penggunaResolvers = {
    Query: {
        me: async (_, __, context) => {
            if (!context.user) {
                throw new graphql_1.GraphQLError("Not authenticated");
            }
            return {
                id: context.user._id.toString(),
                email: context.user.email,
                noHP: context.user.noHP,
                namaLengkap: context.user.namaLengkap,
                isVerified: context.user.isVerified,
                createdAt: context.user.createdAt,
                updatedAt: context.user.updatedAt,
            };
        },
        penggunaById: async (_, { id }) => {
            try {
                const pengguna = await models_1.Pengguna.findById(id);
                if (!pengguna) {
                    throw new graphql_1.GraphQLError("Pengguna tidak ditemukan");
                }
                return {
                    id: pengguna._id.toString(),
                    email: pengguna.email,
                    noHP: pengguna.noHP,
                    namaLengkap: pengguna.namaLengkap,
                    isVerified: pengguna.isVerified,
                    createdAt: pengguna.createdAt,
                    updatedAt: pengguna.updatedAt,
                };
            }
            catch (error) {
                throw new graphql_1.GraphQLError("Error fetching pengguna");
            }
        },
    },
    Mutation: {
        updateProfile: async (_, { input }, context) => {
            if (!context.user) {
                throw new graphql_1.GraphQLError("Not authenticated");
            }
            try {
                const updatedPengguna = await models_1.Pengguna.findByIdAndUpdate(context.user._id, input, { new: true });
                if (!updatedPengguna) {
                    throw new graphql_1.GraphQLError("Pengguna tidak ditemukan");
                }
                return {
                    id: updatedPengguna._id.toString(),
                    email: updatedPengguna.email,
                    noHP: updatedPengguna.noHP,
                    namaLengkap: updatedPengguna.namaLengkap,
                    isVerified: updatedPengguna.isVerified,
                    createdAt: updatedPengguna.createdAt,
                    updatedAt: updatedPengguna.updatedAt,
                };
            }
            catch (error) {
                throw new graphql_1.GraphQLError("Failed to update profile: " + error.message);
            }
        },
        changePassword: async (_, { oldPassword, newPassword, }, context) => {
            if (!context.user) {
                throw new graphql_1.GraphQLError("Not authenticated");
            }
            try {
                const pengguna = await models_1.Pengguna.findById(context.user._id);
                if (!pengguna) {
                    throw new graphql_1.GraphQLError("Pengguna tidak ditemukan");
                }
                const isValidOldPassword = await pengguna.comparePassword(oldPassword);
                if (!isValidOldPassword) {
                    throw new graphql_1.GraphQLError("Password lama salah");
                }
                pengguna.password = newPassword;
                await pengguna.save();
                return true;
            }
            catch (error) {
                if (error instanceof graphql_1.GraphQLError)
                    throw error;
                throw new graphql_1.GraphQLError("Failed to change password: " + error.message);
            }
        },
    },
};
exports.default = exports.penggunaResolvers;
//# sourceMappingURL=index.js.map