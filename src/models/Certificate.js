import mongoose from 'mongoose';
import slugify from 'slugify';

const certificateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Certificate title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    certificateNumber: {
      type: String,
      trim: true,
      default: ''
    },
    issuingBody: {
      type: String,
      required: [true, 'Issuing authority or body is required'],
      trim: true,
      default: 'International Standards Organization'
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      default: 'Quality Management'
    },
    issueDate: {
      type: Date,
      default: null
    },
    expiryDate: {
      type: Date,
      default: null
    },
    fileUrl: {
      type: String,
      required: [true, 'Certificate file or image URL is required'],
      trim: true
    },
    fileType: {
      type: String,
      enum: ['image', 'pdf', 'document'],
      default: 'image'
    },
    thumbnailUrl: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'archived'],
      default: 'published',
      index: true
    },
    displayOrder: {
      type: Number,
      default: 0
    },
    downloadable: {
      type: Boolean,
      default: true
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

certificateSchema.pre('validate', function (next) {
  if (this.title && !this.slug) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.slug = `${slugify(this.title, { lower: true, strict: true })}-${randomSuffix}`;
  }
  if (!this.thumbnailUrl && this.fileType === 'image') {
    this.thumbnailUrl = this.fileUrl;
  }
  next();
});

export const Certificate = mongoose.model('Certificate', certificateSchema);
