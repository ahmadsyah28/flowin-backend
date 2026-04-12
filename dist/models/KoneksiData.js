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
exports.KoneksiData = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const BaseModel_1 = require("./BaseModel");
const enums_1 = require("../enums");
const koneksiDataSchema = new mongoose_1.Schema({
    IdPelanggan: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Pengguna",
        required: [true, "ID Pelanggan is required"],
        index: true,
    },
    StatusPengajuan: {
        type: String,
        enum: Object.values(enums_1.StatusPengajuan),
        default: enums_1.StatusPengajuan.PENDING,
        required: true,
    },
    AlasanPenolakan: {
        type: String,
        trim: true,
        default: null,
    },
    TanggalVerifikasi: {
        type: Date,
        default: null,
    },
    NIK: {
        type: String,
        required: [true, "NIK is required"],
        trim: true,
        minlength: [16, "NIK must be 16 characters"],
        maxlength: [16, "NIK must be 16 characters"],
        match: [/^\d{16}$/, "NIK must be 16 digits"],
        unique: true,
    },
    NIKUrl: {
        type: String,
        required: [true, "NIK document URL is required"],
        trim: true,
    },
    NoKK: {
        type: String,
        required: [true, "No KK is required"],
        trim: true,
        minlength: [16, "No KK must be 16 characters"],
        maxlength: [16, "No KK must be 16 characters"],
        match: [/^\d{16}$/, "No KK must be 16 digits"],
    },
    KKUrl: {
        type: String,
        required: [true, "KK document URL is required"],
        trim: true,
    },
    IMB: {
        type: String,
        required: [true, "IMB number is required"],
        trim: true,
        maxlength: [50, "IMB number cannot exceed 50 characters"],
    },
    IMBUrl: {
        type: String,
        required: [true, "IMB document URL is required"],
        trim: true,
    },
    Alamat: {
        type: String,
        required: [true, "Alamat is required"],
        trim: true,
        maxlength: [500, "Alamat cannot exceed 500 characters"],
    },
    Kelurahan: {
        type: String,
        required: [true, "Kelurahan is required"],
        trim: true,
        maxlength: [100, "Kelurahan cannot exceed 100 characters"],
    },
    Kecamatan: {
        type: String,
        required: [true, "Kecamatan is required"],
        trim: true,
        maxlength: [100, "Kecamatan cannot exceed 100 characters"],
    },
    LuasBangunan: {
        type: Number,
        required: [true, "Luas Bangunan is required"],
        min: [1, "Luas Bangunan must be at least 1 m²"],
        max: [10000, "Luas Bangunan cannot exceed 10000 m²"],
    },
    ...BaseModel_1.baseSchemaFields,
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
(0, BaseModel_1.addBaseMiddleware)(koneksiDataSchema);
koneksiDataSchema.index({ StatusPengajuan: 1 });
koneksiDataSchema.index({ Kecamatan: 1, Kelurahan: 1 });
koneksiDataSchema.index({ createdAt: -1 });
koneksiDataSchema.virtual("pelanggan", {
    ref: "Pengguna",
    localField: "IdPelanggan",
    foreignField: "_id",
    justOne: true,
});
koneksiDataSchema.pre("validate", function () {
    if (this.NIK && this.NoKK && this.NIK === this.NoKK) {
        throw new Error("NIK and No KK cannot be the same");
    }
});
koneksiDataSchema.statics.findByPelanggan = function (pelangganId) {
    return this.findOne({ IdPelanggan: pelangganId }).populate("pelanggan");
};
koneksiDataSchema.statics.findVerified = function () {
    return this.find({ StatusPengajuan: enums_1.StatusPengajuan.APPROVED }).populate("pelanggan");
};
koneksiDataSchema.statics.findPendingVerification = function () {
    return this.find({ StatusPengajuan: enums_1.StatusPengajuan.PENDING }).populate("pelanggan");
};
exports.KoneksiData = mongoose_1.default.model("KoneksiData", koneksiDataSchema);
//# sourceMappingURL=KoneksiData.js.map