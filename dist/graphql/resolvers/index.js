"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const index_js_1 = __importDefault(require("./scalars/index.js"));
const index_js_2 = __importDefault(require("./auth/index.js"));
const index_js_3 = __importDefault(require("./pengguna/index.js"));
const index_js_4 = __importDefault(require("./koneksiData/index.js"));
const index_js_5 = __importDefault(require("./meter/index.js"));
const index_js_6 = __importDefault(require("./tagihan/index.js"));
const index_js_7 = __importDefault(require("./riwayatRagihan/index.js"));
const index_js_8 = __importDefault(require("./geoLokasi/index.js"));
const index_js_9 = __importDefault(require("./laporan/index.js"));
const index_js_10 = __importDefault(require("./notifikasi/index.js"));
const resolvers = (0, lodash_1.merge)(index_js_1.default, index_js_2.default, index_js_3.default, index_js_4.default, index_js_5.default, index_js_6.default, index_js_7.default, index_js_8.default, index_js_9.default, index_js_10.default);
exports.default = resolvers;
//# sourceMappingURL=index.js.map