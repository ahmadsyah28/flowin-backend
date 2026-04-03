import mongoose, { Document } from "mongoose";
export interface IBaseDocument extends Document {
    createdAt: Date;
    updatedAt: Date;
}
export declare const baseSchemaFields: {
    createdAt: {
        type: DateConstructor;
        default: () => number;
    };
    updatedAt: {
        type: DateConstructor;
        default: () => number;
    };
};
export declare const addBaseMiddleware: (schema: mongoose.Schema) => void;
//# sourceMappingURL=BaseModel.d.ts.map