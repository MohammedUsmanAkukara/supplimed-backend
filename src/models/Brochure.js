import mongoose from 'mongoose';
import slugify from 'slugify';

const brochureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Brochure title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    subtitle: {
      type: String,
      trim: true,
      default: ''
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      default: 'Master Catalogue',
      index: true
    },
    fileUrl: {
      type: String,
      required: [true, 'PDF file URL is required'],
      trim: true
    },
    coverImage: {
      type: String,
      trim: true,
      default: '/images/hero-lab.jpg'
    },
    format: {
      type: String,
      default: 'PDF'
    },
    fileSize: {
      type: String,
      default: '3.5 MB'
    },
    pages: {
      type: Number,
      default: 1
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    highlights: {
      type: [String],
      default: []
    },
    tableOfContents: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'archived'],
      default: 'published',
      index: true
    },
    featured: {
      type: Boolean,
      default: false
    },
    displayOrder: {
      type: Number,
      default: 0
    },
    downloadCount: {
      type: Number,
      default: 0
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

brochureSchema.pre('validate', function (next) {
  if (this.title && !this.slug) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.slug = `${slugify(this.title, { lower: true, strict: true })}-${randomSuffix}`;
  }
  next();
});

export const Brochure = mongoose.model('Brochure', brochureSchema);
