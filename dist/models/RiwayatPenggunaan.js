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
exports.RiwayatPenggunaan = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const BaseModel_1 = require("./BaseModel");
const riwayatPenggunaanSchema = new mongoose_1.Schema({
    MeteranId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Meter",
        required: [true, "Meteran ID is required"],
        index: true,
    },
    Periode: {
        type: String,
        required: [true, "Periode is required"],
        match: [/^\d{4}-\d{2}$/, "Periode must be in YYYY-MM format"],
        index: true,
    },
    TotalPenggunaan: {
        type: Number,
        required: [true, "Total Penggunaan is required"],
        min: [0, "Total Penggunaan cannot be negative"],
        default: 0,
    },
    DataHarian: {
        type: Map,
        of: Number,
        default: new Map(),
    },
    DataPerJam: {
        type: Map,
        of: Number,
        default: new Map(),
    },
    ...BaseModel_1.baseSchemaFields,
});
riwayatPenggunaanSchema.index({ MeteranId: 1, Periode: -1 });
riwayatPenggunaanSchema.index({ MeteranId: 1, Periode: 1 }, { unique: true });
(0, BaseModel_1.addBaseMiddleware)(riwayatPenggunaanSchema);
exports.RiwayatPenggunaan = mongoose_1.default.model("RiwayatPenggunaan", riwayatPenggunaanSchema);
//# sourceMappingURL=RiwayatPenggunaan.js.map