"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.riwayatRagihanResolvers = void 0;
const graphql_1 = require("../../../graphql");
const models_1 = require("../../../models");
exports.riwayatRagihanResolvers = {
    Query: {
        riwayatRagihanByMeter: async (_, { meterId }) => {
            try {
                const riwayat = await models_1.RiwayatRagihan.find({
                    MeteranId: meterId,
                }).populate("MeteranId");
                return riwayat.map((r) => ({
                    id: r._id.toString(),
                    MeteranId: r.MeteranId.toString(),
                    PenggunaanAir: r.PenggunaanAir,
                    createdAt: r.createdAt,
                    updatedAt: r.updatedAt,
                }));
            }
            catch (error) {
                throw new graphql_1.GraphQLError("Error fetching riwayat ragihan");
            }
        },
    },
};
exports.default = exports.riwayatRagihanResolvers;
//# sourceMappingURL=index.js.map