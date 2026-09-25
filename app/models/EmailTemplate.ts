import mongoose, { Schema, type Model } from 'mongoose';
import { EMAIL_TYPES, type EmailTemplateConfig } from '@/lib/email/templates';

const schema = new Schema<EmailTemplateConfig>({
  type: { type: String, enum: EMAIL_TYPES, required: true, unique: true },
  enabled: { type: Boolean, required: true, default: true },
  subject: { type: String, required: true, maxlength: 200 },
  body: { type: String, required: true, maxlength: 20000 },
}, { timestamps: true });
export default (mongoose.models.EmailTemplate as Model<EmailTemplateConfig> | undefined) ||
  mongoose.model<EmailTemplateConfig>('EmailTemplate', schema);
