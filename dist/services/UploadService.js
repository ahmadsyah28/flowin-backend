"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const stream_1 = require("stream");
const cloudinary_1 = require("../config/cloudinary");
class UploadService {
    static async uploadDocument(buffer, folder, context = {}, tags = []) {
        return new Promise((resolve, reject) => {
            const stream = cloudinary_1.cloudinary.uploader.upload_stream({
                resource_type: "raw",
                folder: `flowin-pelanggan/${folder}`,
                context,
                tags,
                format: "pdf",
            }, (error, result) => {
                if (error || !result)
                    return reject(error);
                resolve({ url: result.secure_url, publicId: result.public_id });
            });
            stream_1.Readable.from(buffer).pipe(stream);
        });
    }
}
exports.UploadService = UploadService;
//# sourceMappingURL=UploadService.js.map