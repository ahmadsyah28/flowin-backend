import { Router } from "express";
import multer from "multer";
import { UploadController } from "@/controllers/UploadController";
import { restAuthMiddleware } from "@/middlewares";

const uploadRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // max 10MB
  fileFilter: (_, file, cb) => {
    const isPdfMime =
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/octet-stream";
    const isPdfExt = file.originalname.toLowerCase().endsWith(".pdf");
    if (isPdfMime && isPdfExt) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file PDF yang diizinkan"));
    }
  },
});

/**
 * POST /api/upload/:folder
 *
 * Upload dokumen PDF ke Cloudinary dengan signed upload (metadata tersimpan).
 * folder: nik | kk | imb
 *
 * Body (multipart/form-data):
 *   file: PDF file
 *   nik?: string
 *   no_kk?: string
 *   imb?: string
 *   kecamatan?: string
 *   kelurahan?: string
 */
uploadRouter.post(
  "/upload/:folder",
  restAuthMiddleware,
  upload.single("file"),
  UploadController.uploadDokumen,
);

export default uploadRouter;
