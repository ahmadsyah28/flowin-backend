export interface UploadResult {
    url: string;
    publicId: string;
}
export declare class UploadService {
    static uploadDocument(buffer: Buffer, folder: string, context?: Record<string, string>, tags?: string[]): Promise<UploadResult>;
}
//# sourceMappingURL=UploadService.d.ts.map