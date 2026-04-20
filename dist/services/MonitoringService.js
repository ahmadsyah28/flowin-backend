"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringService = void 0;
const mongoose_1 = require("mongoose");
const models_1 = require("../models");
const Meter_1 = require("../models/Meter");
const KelompokPelanggan_1 = require("../models/KelompokPelanggan");
const redis_1 = require("../config/redis");
function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}
function getPeriode(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
}
function getPreviousPeriode(date) {
    const prevDate = new Date(date);
    prevDate.setMonth(prevDate.getMonth() - 1);
    return getPeriode(prevDate);
}
function literToM3(liter) {
    return liter / 1000;
}
function hitungTagihan(kelompok, pemakaianM3) {
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
}
async function getRedisMonthlyUsage(meteranId, periode) {
    try {
        const dailyKey = `usage:${meteranId}:${periode}:daily`;
        const totalKey = `usage:${meteranId}:${periode}:total`;
        const dailyData = await (0, redis_1.hgetall)(dailyKey);
        const totalStr = await (0, redis_1.getRedisData)(totalKey);
        const total = totalStr ? parseFloat(totalStr) : 0;
        if (!dailyData && !totalStr) {
            return null;
        }
        const dataHarian = {};
        if (dailyData) {
            Object.entries(dailyData).forEach(([date, value]) => {
                dataHarian[date] =
                    typeof value === "number" ? value : parseFloat(value);
            });
        }
        return {
            periode,
            totalPenggunaan: total,
            dataHarian,
            sumber: "redis",
        };
    }
    catch (error) {
        console.error(`Error getting Redis data for ${meteranId}:`, error);
        return null;
    }
}
async function getLatestReading(meteranId) {
    try {
        const latestKey = `usage:${meteranId}:latest`;
        const data = await (0, redis_1.getRedisData)(latestKey);
        if (!data) {
            return null;
        }
        const parsed = JSON.parse(data);
        return {
            volume: parsed.volume || 0,
            timestamp: parsed.timestamp || new Date().toISOString(),
            meteranId,
        };
    }
    catch (error) {
        console.error(`Error getting latest reading for ${meteranId}:`, error);
        return null;
    }
}
async function getMongoMonthlyUsage(meteranId, periode) {
    try {
        const riwayat = await models_1.RiwayatPenggunaan.findOne({
            MeteranId: meteranId,
            Periode: periode,
        });
        if (!riwayat) {
            return null;
        }
        const dataHarian = {};
        if (riwayat.DataHarian) {
            riwayat.DataHarian.forEach((value, key) => {
                dataHarian[key] = value;
            });
        }
        return {
            periode: riwayat.Periode,
            totalPenggunaan: riwayat.TotalPenggunaan,
            dataHarian,
            sumber: "mongodb",
        };
    }
    catch (error) {
        console.error(`Error getting MongoDB data for ${meteranId}:`, error);
        return null;
    }
}
async function getTotalAllTime(meteranId) {
    try {
        const result = await models_1.RiwayatPenggunaan.aggregate([
            { $match: { MeteranId: new mongoose_1.Types.ObjectId(meteranId.toString()) } },
            { $group: { _id: null, total: { $sum: "$TotalPenggunaan" } } },
        ]);
        return result.length > 0 ? result[0].total : 0;
    }
    catch (error) {
        console.error(`Error calculating total for ${meteranId}:`, error);
        return 0;
    }
}
async function getMonthlyAverage(meteranId) {
    try {
        const riwayat = await models_1.RiwayatPenggunaan.find({
            MeteranId: meteranId,
        })
            .sort({ Periode: -1 })
            .limit(6);
        if (riwayat.length === 0) {
            return 0;
        }
        const total = riwayat.reduce((sum, r) => sum + r.TotalPenggunaan, 0);
        return Math.round(total / riwayat.length);
    }
    catch (error) {
        console.error(`Error calculating average for ${meteranId}:`, error);
        return 0;
    }
}
function calculateComparison(bulanIni, bulanLalu) {
    const selisih = bulanIni - bulanLalu;
    const persentase = bulanLalu > 0 ? Math.round((selisih / bulanLalu) * 100) : 0;
    let status;
    if (selisih > 0) {
        status = "naik";
    }
    else if (selisih < 0) {
        status = "turun";
    }
    else {
        status = "sama";
    }
    return {
        bulanIni,
        bulanLalu,
        selisih,
        persentase,
        status,
    };
}
function calculatePrediction(penggunaanSaatIni, tanggalHariIni) {
    const tahun = tanggalHariIni.getFullYear();
    const bulan = tanggalHariIni.getMonth() + 1;
    const tanggal = tanggalHariIni.getDate();
    const totalHari = getDaysInMonth(tahun, bulan);
    const hariTerlewati = tanggal;
    const hariTersisa = totalHari - hariTerlewati;
    const rataRataHarian = hariTerlewati > 0 ? Math.round(penggunaanSaatIni / hariTerlewati) : 0;
    const prediksiAkhirBulan = Math.round(rataRataHarian * totalHari);
    return {
        hariTerlewati,
        hariTersisa,
        totalHari,
        rataRataHarian,
        prediksiAkhirBulan,
        penggunaanSaatIni,
    };
}
function evaluateUsage(rataRataBulanan) {
    const batasHemat = 5000;
    const batasBoros = 15000;
    let kategori;
    let deskripsi;
    if (rataRataBulanan < batasHemat) {
        kategori = "hemat";
        deskripsi =
            "Penggunaan air Anda tergolong hemat. Pertahankan kebiasaan baik ini!";
    }
    else if (rataRataBulanan <= batasBoros) {
        kategori = "normal";
        deskripsi =
            "Penggunaan air Anda berada dalam kisaran normal untuk rumah tangga.";
    }
    else {
        kategori = "boros";
        deskripsi =
            "Penggunaan air Anda cukup tinggi. Pertimbangkan untuk menghemat penggunaan air.";
    }
    return {
        kategori,
        deskripsi,
        rataRataBulanan,
        batasHemat,
        batasBoros,
    };
}
function buildDailyChart(bulanIni, bulanLalu, tanggalHariIni) {
    const result = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(tanggalHariIni);
        date.setDate(date.getDate() - i);
        const periode = getPeriode(date);
        const tanggal = String(date.getDate()).padStart(2, "0");
        const displayDate = `${tanggal}/${String(date.getMonth() + 1).padStart(2, "0")}`;
        let liter = 0;
        if (bulanIni && periode === bulanIni.periode) {
            liter = bulanIni.dataHarian[tanggal] || 0;
        }
        else if (bulanLalu && periode === bulanLalu.periode) {
            liter = bulanLalu.dataHarian[tanggal] || 0;
        }
        result.push({
            tanggal: displayDate,
            liter: Math.round(liter),
        });
    }
    return result;
}
class MonitoringService {
    static async getDashboard(meteranId) {
        try {
            const meter = await Meter_1.Meter.findById(meteranId).populate("IdKelompokPelanggan");
            if (!meter) {
                return {
                    success: false,
                    message: "Meteran tidak ditemukan",
                    data: null,
                };
            }
            const meteranIdStr = meteranId.toString();
            const now = new Date();
            const periodeIni = getPeriode(now);
            const periodeLalu = getPreviousPeriode(now);
            const bulanIni = await getRedisMonthlyUsage(meteranIdStr, periodeIni);
            const bulanLalu = await getMongoMonthlyUsage(meteranId, periodeLalu);
            const latestReading = await getLatestReading(meteranIdStr);
            const totalMongo = await getTotalAllTime(meteranId);
            const totalBulanIni = bulanIni?.totalPenggunaan || 0;
            const totalKeseluruhan = totalMongo + totalBulanIni;
            const rataRataBulanan = await getMonthlyAverage(meteranId);
            let perbandingan = null;
            if (bulanLalu) {
                perbandingan = calculateComparison(totalBulanIni, bulanLalu.totalPenggunaan);
            }
            let prediksi = null;
            if (totalBulanIni > 0) {
                prediksi = calculatePrediction(totalBulanIni, now);
            }
            const evaluasi = evaluateUsage(rataRataBulanan > 0 ? rataRataBulanan : totalBulanIni);
            let estimasiTagihan = null;
            const kelompok = await KelompokPelanggan_1.KelompokPelanggan.findById(meter.IdKelompokPelanggan);
            if (kelompok) {
                const pemakaianLiter = totalBulanIni;
                const pemakaianM3 = literToM3(pemakaianLiter);
                const tagihan = hitungTagihan(kelompok, pemakaianM3);
                estimasiTagihan = {
                    pemakaianM3: Math.round(pemakaianM3 * 100) / 100,
                    tarifRendah: kelompok.TarifRendah,
                    tarifTinggi: kelompok.TarifTinggi,
                    batasRendah: kelompok.BatasRendah,
                    biayaPemakaian: tagihan.biayaPemakaian,
                    biayaBeban: tagihan.biayaBeban,
                    totalEstimasi: tagihan.total,
                    kelompok: {
                        kode: kelompok.KodeKelompok,
                        nama: kelompok.NamaKelompok,
                        kategori: kelompok.Kategori,
                    },
                };
            }
            const chartHarian = buildDailyChart(bulanIni, bulanLalu, now);
            return {
                success: true,
                message: "Berhasil mendapatkan data monitoring",
                data: {
                    meteran: {
                        id: meteranIdStr,
                        nomorMeteran: meter.NomorMeteran,
                        nomorAkun: meter.NomorAkun,
                    },
                    latestReading,
                    bulanIni,
                    bulanLalu,
                    totalKeseluruhan,
                    rataRataBulanan,
                    perbandingan,
                    prediksi,
                    evaluasi,
                    estimasiTagihan,
                    chartHarian,
                },
            };
        }
        catch (error) {
            console.error("Error in MonitoringService.getDashboard:", error);
            return {
                success: false,
                message: error.message || "Gagal mendapatkan data monitoring",
                data: null,
            };
        }
    }
    static async getHistory(meteranId, jumlahBulan = 6) {
        try {
            const riwayat = await models_1.RiwayatPenggunaan.find({
                MeteranId: meteranId,
            })
                .sort({ Periode: -1 })
                .limit(jumlahBulan);
            const data = riwayat.map((r) => {
                const dataHarian = {};
                if (r.DataHarian) {
                    r.DataHarian.forEach((value, key) => {
                        dataHarian[key] = value;
                    });
                }
                return {
                    periode: r.Periode,
                    totalPenggunaan: r.TotalPenggunaan,
                    dataHarian,
                    sumber: "mongodb",
                };
            });
            return {
                success: true,
                message: "Berhasil mendapatkan riwayat penggunaan",
                data,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mendapatkan riwayat",
                data: null,
            };
        }
    }
    static async getHourlyUsage(meteranId, tanggal) {
        try {
            const hourlyKey = `usage:${meteranId}:${tanggal}:hourly`;
            const hourlyData = await (0, redis_1.hgetall)(hourlyKey);
            if (!hourlyData) {
                return {
                    success: false,
                    message: "Data per jam tidak ditemukan untuk tanggal tersebut",
                    data: null,
                };
            }
            const data = {};
            Object.entries(hourlyData).forEach(([hour, value]) => {
                data[hour] =
                    typeof value === "number" ? value : parseFloat(String(value));
            });
            return {
                success: true,
                message: "Berhasil mendapatkan data per jam",
                data,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mendapatkan data per jam",
                data: null,
            };
        }
    }
    static async getMonthlyUsage(meteranId, periode) {
        try {
            const meter = await Meter_1.Meter.findById(meteranId);
            if (!meter) {
                return {
                    success: false,
                    message: "Meteran tidak ditemukan",
                    data: null,
                };
            }
            const now = new Date();
            const currentPeriode = getPeriode(now);
            const meteranIdStr = meteranId.toString();
            let data = null;
            if (periode === currentPeriode) {
                data = await getRedisMonthlyUsage(meteranIdStr, periode);
            }
            else {
                data = await getMongoMonthlyUsage(meteranId, periode);
            }
            return {
                success: true,
                message: data
                    ? "Berhasil mendapatkan data penggunaan"
                    : "Tidak ada data untuk periode ini",
                data,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mendapatkan data penggunaan bulanan",
                data: null,
            };
        }
    }
}
exports.MonitoringService = MonitoringService;
//# sourceMappingURL=MonitoringService.js.map