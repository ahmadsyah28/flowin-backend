import { Readable } from "stream";
import { cloudinary } from "@/config/cloudinary";

export interface UploadResult {
  url: string;
  publicId: string;
}

export class UploadService {
  static async uploadDocument(
    buffer: Buffer,
    folder: string,
    context: Record<string, string> = {},
    tags: string[] = [],
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: `flowin-pelanggan/${folder}`,
          context,
          tags,
          format: "pdf",
        },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );

      Readable.from(buffer).pipe(stream);
    });
  }
}
