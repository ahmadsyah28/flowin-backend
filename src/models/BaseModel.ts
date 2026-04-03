import mongoose, { Document } from "mongoose";

export interface IBaseDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
}

export const baseSchemaFields = {
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

export const addBaseMiddleware = (schema: mongoose.Schema) => {
  schema.pre("save", function (this: any) {
    if (this.isModified() && !this.isNew) {
      this.updatedAt = new Date();
    }
  });

  schema.pre("findOneAndUpdate", function (this: any) {
    this.set({ updatedAt: new Date() });
  });

  schema.pre("updateOne", function (this: any) {
    this.set({ updatedAt: new Date() });
  });

  schema.pre("updateMany", function (this: any) {
    this.set({ updatedAt: new Date() });
  });
};
