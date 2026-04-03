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
exports.Pembayaran = exports.EnumStatusPembayaran = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const BaseModel_1 = require("./BaseModel");
var EnumStatusPembayaran;
(function (EnumStatusPembayaran) {
    EnumStatusPembayaran["PENDING"] = "Pending";
    EnumStatusPembayaran["SUKSES"] = "Settlement";
    EnumStatusPembayaran["GAGAL"] = "Cancel";
    EnumStatusPembayaran["EXPIRED"] = "Expire";
    EnumStatusPembayaran["REFUND"] = "Refund";
})(EnumStatusPembayaran || (exports.EnumStatusPembayaran = EnumStatusPembayaran = {}));
const pembayaranSchema = new mongoose_1.Schema({
    IdTagihan: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Tagihan",
        required: [true, "ID Tagihan is required"],
        index: true,
    },
    IdPengguna: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Pengguna",
        required: [true, "ID Pengguna is required"],
        index: true,
    },
    MidtransOrderId: {
        type: String,
        required: [true, "Midtrans Order ID is required"],
        unique: true,
        trim: true,
    },
    MidtransTransactionId: {
        type: String,
        default: null,
        trim: true,
    },
    SnapToken: {
        type: String,
        required: [true, "Snap Token is required"],
        trim: true,
    },
    SnapRedirectUrl: {
        type: String,
        required: [true, "Snap Redirect URL is required"],
        trim: true,
    },
    MetodePembayaran: {
        type: String,
        default: null,
        trim: true,
    },
    JumlahBayar: {
        type: Number,
        required: [true, "Jumlah Bayar is required"],
        min: [0, "Jumlah Bayar cannot be negative"],
    },
    StatusPembayaran: {
        type: String,
        enum: Object.values(EnumStatusPembayaran),
        default: EnumStatusPembayaran.PENDING,
        required: true,
    },
    MidtransResponse: {
        type: mongoose_1.Schema.Types.Mixed,
        default: null,
    },
    TanggalBayar: {
        type: Date,
        default: null,
    },
    ...BaseModel_1.baseSchemaFields,
});
pembayaranSchema.index({ IdPengguna: 1, createdAt: -1 });
pembayaranSchema.index({ IdTagihan: 1, StatusPembayaran: 1 });
(0, BaseModel_1.addBaseMiddleware)(pembayaranSchema);
exports.Pembayaran = mongoose_1.default.model("Pembayaran", pembayaranSchema);
//# sourceMappingURL=Pembayaran.js.map