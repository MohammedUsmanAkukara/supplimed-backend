import mongoose from 'mongoose';

const navigationSchema = new mongoose.Schema(
  {
    placement: {
      type: String,
      enum: ['header', 'footer_company', 'footer_categories', 'footer_legal'],
      default: 'header',
      index: true
    },
    label: {
      type: String,
      required: [true, 'Label is required'],
      trim: true
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true
    },
    isExternal: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    children: [
      {
        label: { type: String, required: true },
        url: { type: String, required: true },
        isExternal: { type: Boolean, default: false },
        order: { type: Number, default: 0 }
      }
    ]
  },
  {
    timestamps: true
  }
);

export const Navigation = mongoose.model('Navigation', navigationSchema);
