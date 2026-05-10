"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const UploadController_1 = require("../controllers/UploadController");
const middlewares_1 = require("../middlewares");
const uploadRouter = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_, file, cb) => {
        const isPdfMime = file.mimetype === "application/pdf" ||
            file.mimetype === "application/octet-stream";
        const isPdfExt = file.originalname.toLowerCase().endsWith(".pdf");
        if (isPdfMime && isPdfExt) {
            cb(null, true);
        }
        else {
            cb(new Error("Hanya file PDF yang diizinkan"));
        }
    },
});
uploadRouter.post("/upload/:folder", middlewares_1.restAuthMiddleware, upload.single("file"), UploadController_1.UploadController.uploadDokumen);
exports.default = uploadRouter;
//# sourceMappingURL=UploadRouter.js.map