"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const UploadService_1 = require("../services/UploadService");
const ALLOWED_FOLDERS = ["nik", "kk", "imb"];
class UploadController {
    static async uploadDokumen(req, res) {
        try {
            const file = req.file;
            if (!file) {
                res
                    .status(400)
                    .json({ success: false, message: "File tidak ditemukan" });
                return;
            }
            const folder = req.params.folder;
            if (!ALLOWED_FOLDERS.includes(folder)) {
                res
                    .status(400)
                    .json({
                    success: false,
                    message: "Folder tidak valid. Gunakan: nik, kk, atau imb",
                });
                return;
            }
            const user = req.user;
            const context = {
                document_type: folder,
                app: "flowin-pelanggan",
                uploaded_at: new Date().toISOString().split(".")[0],
                pelanggan_id: user._id.toString(),
                ...(req.body.nik && { nik: req.body.nik }),
                ...(req.body.no_kk && { no_kk: req.body.no_kk }),
                ...(req.body.imb && { imb: req.body.imb }),
                ...(req.body.kecamatan && { kecamatan: req.body.kecamatan }),
                ...(req.body.kelurahan && { kelurahan: req.body.kelurahan }),
            };
            const tags = ["flowin-pelanggan", "dokumen", folder];
            const result = await UploadService_1.UploadService.uploadDocument(file.buffer, folder, context, tags);
            res.json({
                success: true,
                message: "Upload berhasil",
                url: result.url,
                fileName: file.originalname,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || "Upload gagal",
            });
        }
    }
}
exports.UploadController = UploadController;
//# sourceMappingURL=UploadController.js.map