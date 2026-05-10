import { Request, Response } from "express";
import { UploadService } from "@/services/UploadService";

const ALLOWED_FOLDERS = ["nik", "kk", "imb"] as const;
type AllowedFolder = (typeof ALLOWED_FOLDERS)[number];

export class UploadController {
  static async uploadDokumen(req: Request, res: Response): Promise<void> {
    try {
      const file = req.file;
      if (!file) {
        res
          .status(400)
          .json({ success: false, message: "File tidak ditemukan" });
        return;
      }

      const folder = req.params.folder as AllowedFolder;
      if (!ALLOWED_FOLDERS.includes(folder)) {
        res
          .status(400)
          .json({
            success: false,
            message: "Folder tidak valid. Gunakan: nik, kk, atau imb",
          });
        return;
      }

      const user = (req as any).user;

      const context: Record<string, string> = {
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

      const result = await UploadService.uploadDocument(
        file.buffer,
        folder,
        context,
        tags,
      );

      res.json({
        success: true,
        message: "Upload berhasil",
        url: result.url,
        fileName: file.originalname,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Upload gagal",
      });
    }
  }
}
