"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addBaseMiddleware = exports.baseSchemaFields = void 0;
exports.baseSchemaFields = {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
};
const addBaseMiddleware = (schema) => {
    schema.pre("save", function () {
        if (this.isModified() && !this.isNew) {
            this.updatedAt = new Date();
        }
    });
    schema.pre("findOneAndUpdate", function () {
        this.set({ updatedAt: new Date() });
    });
    schema.pre("updateOne", function () {
        this.set({ updatedAt: new Date() });
    });
    schema.pre("updateMany", function () {
        this.set({ updatedAt: new Date() });
    });
};
exports.addBaseMiddleware = addBaseMiddleware;
//# sourceMappingURL=BaseModel.js.map