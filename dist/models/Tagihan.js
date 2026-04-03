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
exports.Tagihan = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const BaseModel_1 = require("./BaseModel");
const enums_1 = require("../enums");
const tagihanSchema = new mongoose_1.Schema({
    IdMeteran: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Meter",
        required: [true, "Meteran ID is required"],
        index: true,
    },
    Periode: {
        type: String,
        required: [true, "Periode is required"],
        trim: true,
    },
    PenggunaanSebelum: {
        type: Number,
        required: [true, "Penggunaan Sebelum is required"],
        min: [0, "Penggunaan Sebelum cannot be negative"],
    },
    PenggunaanSekarang: {
        type: Number,
        required: [true, "Penggunaan Sekarang is required"],
        min: [0, "Penggunaan Sekarang cannot be negative"],
    },
    TotalPemakaian: {
        type: Number,
        required: [true, "Total Pemakaian is required"],
        min: [0, "Total Pemakaian cannot be negative"],
    },
    Biaya: {
        type: Number,
        required: [true, "Biaya is required"],
        min: [0, "Biaya cannot be negative"],
    },
    TotalBiaya: {
        type: Number,
        required: [true, "Total Biaya is required"],
        min: [0, "Total Biaya cannot be negative"],
    },
    StatusPembayaran: {
        type: String,
        enum: Object.values(enums_1.EnumPaymentStatus),
        default: enums_1.EnumPaymentStatus.PENDING,
        required: true,
    },
    TanggalPembayaran: {
        type: Date,
        default: null,
    },
    MetodePembayaran: {
        type: String,
        default: null,
        trim: true,
    },
    TenggatWaktu: {
        type: Date,
        required: [true, "Tenggat Waktu is required"],
    },
    Menunggak: {
        type: Boolean,
        default: false,
        required: true,
    },
    Denda: {
        type: Number,
        default: 0,
        min: [0, "Denda cannot be negative"],
    },
    Catatan: {
        type: String,
        default: null,
        trim: true,
    },
    ...BaseModel_1.baseSchemaFields,
});
(0, BaseModel_1.addBaseMiddleware)(tagihanSchema);
exports.Tagihan = mongoose_1.default.model("Tagihan", tagihanSchema);
//# sourceMappingURL=Tagihan.js.map