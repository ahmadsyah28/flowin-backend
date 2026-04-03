"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addBaseMiddleware = exports.baseSchemaFields = void 0;
exports.baseSchemaFields = {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
};
const addBaseMiddleware = (schema) => {
    schema.pre("save", function (next) {
        if (this.isModified() && !this.isNew) {
            this.updatedAt = new Date();
        }
        next();
    });
    schema.pre("findOneAndUpdate", function (next) {
        this.set({ updatedAt: new Date() });
        next();
    });
    schema.pre("updateOne", function (next) {
        this.set({ updatedAt: new Date() });
        next();
    });
    schema.pre("updateMany", function (next) {
        this.set({ updatedAt: new Date() });
        next();
    });
};
exports.addBaseMiddleware = addBaseMiddleware;
//# sourceMappingURL=BaseModel.js.map