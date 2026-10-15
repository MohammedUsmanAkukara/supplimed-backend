import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
      trim: true
    },
    storageKey: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    provider: {
      type: String,
      enum: ['cloudinary', 'local', 's3'],
      default: 'local'
    },
    mimeType: {
      type: String,
      default: ''
    },
    size: {
      type: Number,
      default: 0
    },
    dimensions: {
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 }
    },
    altText: {
      type: String,
      trim: true,
      default: ''
    },
    caption: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      enum: ['general', 'products', 'facilities', 'lab', 'certifications'],
      default: 'general',
      index: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

mediaSchema.index({ originalName: 'text', altText: 'text', caption: 'text' });

export const Media = mongoose.model('Media', mediaSchema);
export default Media;
