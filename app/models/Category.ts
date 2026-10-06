import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  aliases?: string[];
  description?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    aliases: { type: [String], default: [], index: true },
    description: { type: String },
    image: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
