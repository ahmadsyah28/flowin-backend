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
exports.kelompokPelangganSeed = exports.KelompokPelanggan = exports.KategoriKelompok = exports.KodeKelompok = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const BaseModel_1 = require("./BaseModel");
var KodeKelompok;
(function (KodeKelompok) {
    KodeKelompok["SOSIAL_UMUM"] = "SOS-U";
    KodeKelompok["SOSIAL_KHUSUS"] = "SOS-K";
    KodeKelompok["RUMAH_TANGGA_A"] = "RT-1";
    KodeKelompok["RUMAH_TANGGA_B"] = "RT-2";
    KodeKelompok["RUMAH_TANGGA_C"] = "RT-3";
    KodeKelompok["RUMAH_TANGGA_D"] = "RT-4";
    KodeKelompok["NIAGA_KECIL"] = "N-1";
    KodeKelompok["NIAGA_MENENGAH"] = "N-2";
    KodeKelompok["NIAGA_BESAR"] = "N-3";
    KodeKelompok["INSTANSI_PEMERINTAH"] = "IP";
    KodeKelompok["KHUSUS"] = "KH";
})(KodeKelompok || (exports.KodeKelompok = KodeKelompok = {}));
var KategoriKelompok;
(function (KategoriKelompok) {
    KategoriKelompok["SOSIAL"] = "Sosial";
    KategoriKelompok["NON_NIAGA"] = "Non Niaga";
    KategoriKelompok["NIAGA"] = "Niaga";
    KategoriKelompok["INSTANSI_PEMERINTAH"] = "Instansi Pemerintah";
    KategoriKelompok["KHUSUS"] = "Khusus";
})(KategoriKelompok || (exports.KategoriKelompok = KategoriKelompok = {}));
const kelompokPelangganSchema = new mongoose_1.Schema({
    KodeKelompok: {
        type: String,
        enum: Object.values(KodeKelompok),
        required: [true, "Kode Kelompok is required"],
        unique: true,
        index: true,
    },
    NamaKelompok: {
        type: String,
        required: [true, "Nama Kelompok is required"],
    },
    Kategori: {
        type: String,
        enum: Object.values(KategoriKelompok),
        required: [true, "Kategori is required"],
        index: true,
    },
    Deskripsi: {
        type: String,
    },
    TarifRendah: {
        type: Number,
        required: [true, "Tarif Rendah is required"],
        min: [0, "Tarif Rendah cannot be negative"],
    },
    TarifTinggi: {
        type: Number,
        required: [true, "Tarif Tinggi is required"],
        min: [0, "Tarif Tinggi cannot be negative"],
    },
    BatasRendah: {
        type: Number,
        default: 10,
        min: [0, "Batas Rendah cannot be negative"],
    },
    BiayaBeban: {
        type: Number,
        required: [true, "Biaya Beban is required"],
        min: [0, "Biaya Beban cannot be negative"],
    },
    IsKesepakatan: {
        type: Boolean,
        default: false,
    },
    ...BaseModel_1.baseSchemaFields,
});
(0, BaseModel_1.addBaseMiddleware)(kelompokPelangganSchema);
kelompokPelangganSchema.statics.hitungTagihan = function (kelompok, pemakaianM3) {
    if (kelompok.IsKesepakatan) {
        return {
            biayaPemakaian: 0,
            biayaBeban: kelompok.BiayaBeban,
            total: kelompok.BiayaBeban,
        };
    }
    let biayaPemakaian = 0;
    if (pemakaianM3 <= kelompok.BatasRendah) {
        biayaPemakaian = pemakaianM3 * kelompok.TarifRendah;
    }
    else {
        biayaPemakaian =
            kelompok.BatasRendah * kelompok.TarifRendah +
                (pemakaianM3 - kelompok.BatasRendah) * kelompok.TarifTinggi;
    }
    return {
        biayaPemakaian: Math.round(biayaPemakaian),
        biayaBeban: kelompok.BiayaBeban,
        total: Math.round(biayaPemakaian) + kelompok.BiayaBeban,
    };
};
exports.KelompokPelanggan = mongoose_1.default.model("KelompokPelanggan", kelompokPelangganSchema);
exports.kelompokPelangganSeed = [
    {
        KodeKelompok: KodeKelompok.SOSIAL_UMUM,
        NamaKelompok: "Sosial Umum",
        Kategori: KategoriKelompok.SOSIAL,
        Deskripsi: "Hydrant umum, WC umum, kamar mandi umum, rumah ibadah, fire hydrant",
        TarifRendah: 4400,
        TarifTinggi: 5500,
        BatasRendah: 10,
        BiayaBeban: 10000,
        IsKesepakatan: false,
    },
    {
        KodeKelompok: KodeKelompok.SOSIAL_KHUSUS,
        NamaKelompok: "Sosial Khusus",
        Kategori: KategoriKelompok.SOSIAL,
        Deskripsi: "Sekolah negeri/swasta (SD, SLTP, SLTA), panti asuhan, terminal air",
        TarifRendah: 5500,
        TarifTinggi: 5750,
        BatasRendah: 10,
        BiayaBeban: 10000,
        IsKesepakatan: false,
    },
    {
        KodeKelompok: KodeKelompok.RUMAH_TANGGA_A,
        NamaKelompok: "Rumah Tangga A (RT-1)",
        Kategori: KategoriKelompok.NON_NIAGA,
        Deskripsi: "Rumah tangga kategori A",
        TarifRendah: 5500,
        TarifTinggi: 6000,
        BatasRendah: 10,
        BiayaBeban: 10000,
        IsKesepakatan: false,
    },
    {
        KodeKelompok: KodeKelompok.RUMAH_TANGGA_B,
        NamaKelompok: "Rumah Tangga B (RT-2)",
        Kategori: KategoriKelompok.NON_NIAGA,
        Deskripsi: "Rumah tangga kategori B",
        TarifRendah: 6000,
        TarifTinggi: 6500,
        BatasRendah: 10,
        BiayaBeban: 10000,
        IsKesepakatan: false,
    },
    {
        KodeKelompok: KodeKelompok.RUMAH_TANGGA_C,
        NamaKelompok: "Rumah Tangga C (RT-3)",
        Kategori: KategoriKelompok.NON_NIAGA,
        Deskripsi: "Rumah tangga kategori C",
        TarifRendah: 6500,
        TarifTinggi: 7000,
        BatasRendah: 10,
        BiayaBeban: 10000,
        IsKesepakatan: false,
    },
    {
        KodeKelompok: KodeKelompok.RUMAH_TANGGA_D,
        NamaKelompok: "Rumah Tangga D (RT-4)",
        Kategori: KategoriKelompok.NON_NIAGA,
        Deskripsi: "Rumah tangga kategori D",
        TarifRendah: 7000,
        TarifTinggi: 9000,
        BatasRendah: 10,
        BiayaBeban: 10000,
        IsKesepakatan: false,
    },
    {
        KodeKelompok: KodeKelompok.NIAGA_KECIL,
        NamaKelompok: "Niaga Kecil (N-1)",
        Kategori: KategoriKelompok.NIAGA,
        Deskripsi: "Usaha niaga skala kecil",
        TarifRendah: 7000,
        TarifTinggi: 7500,
        BatasRendah: 10,
        BiayaBeban: 20000,
        IsKesepakatan: false,
    },
    {
        KodeKelompok: KodeKelompok.NIAGA_MENENGAH,
        NamaKelompok: "Niaga Menengah (N-2)",
        Kategori: KategoriKelompok.NIAGA,
        Deskripsi: "Usaha niaga skala menengah",
        TarifRendah: 7500,
        TarifTinggi: 8000,
        BatasRendah: 10,
        BiayaBeban: 20000,
        IsKesepakatan: false,
    },
    {
        KodeKelompok: KodeKelompok.NIAGA_BESAR,
        NamaKelompok: "Niaga Besar (N-3)",
        Kategori: KategoriKelompok.NIAGA,
        Deskripsi: "Usaha niaga skala besar",
        TarifRendah: 8000,
        TarifTinggi: 9000,
        BatasRendah: 10,
        BiayaBeban: 20000,
        IsKesepakatan: false,
    },
    {
        KodeKelompok: KodeKelompok.INSTANSI_PEMERINTAH,
        NamaKelompok: "Instansi Pemerintah",
        Kategori: KategoriKelompok.INSTANSI_PEMERINTAH,
        Deskripsi: "Perguruan tinggi negeri/swasta, rumah sakit umum negeri/swasta, instansi pemerintah/TNI/POLRI",
        TarifRendah: 7000,
        TarifTinggi: 9000,
        BatasRendah: 10,
        BiayaBeban: 20000,
        IsKesepakatan: false,
    },
    {
        KodeKelompok: KodeKelompok.KHUSUS,
        NamaKelompok: "Khusus",
        Kategori: KategoriKelompok.KHUSUS,
        Deskripsi: "Tarif berdasarkan kesepakatan dengan pelanggan",
        TarifRendah: 0,
        TarifTinggi: 0,
        BatasRendah: 10,
        BiayaBeban: 0,
        IsKesepakatan: true,
    },
];
//# sourceMappingURL=KelompokPelanggan.js.map