"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Meter = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const BaseModel_1 = require("./BaseModel");
const meterSchema = new mongoose_1.Schema({
    IdKelompokPelanggan: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "KelompokPelanggan",
        required: [true, "ID Kelompok Pelanggan is required"],
        index: true,
    },
    IdKoneksiData: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "KoneksiData",
        required: [true, "ID Koneksi Data is required"],
        index: true,
    },
    NomorMeteran: {
        type: String,
        required: [true, "Nomor Meteran is required"],
        unique: true,
        trim: true,
    },
    NomorAkun: {
        type: String,
        required: [true, "Nomor Akun is required"],
        unique: true,
        trim: true,
    },
    ...BaseModel_1.baseSchemaFields,
});
(0, BaseModel_1.addBaseMiddleware)(meterSchema);
exports.Meter = mongoose_1.default.model("Meter", meterSchema);
//# sourceMappingURL=Meter.js.map