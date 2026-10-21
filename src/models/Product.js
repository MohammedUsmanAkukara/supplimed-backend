import mongoose from 'mongoose';
import slugify from 'slugify';

const specificationSchema = new mongoose.Schema(
  {
    key: { type: String, trim: true, default: '' },
    value: { type: String, trim: true, default: '' }
  },
  { _id: false }
);

const attributeSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    value: { type: String, trim: true, default: '' }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    sku: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
      index: true
    },
    shortDescription: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    packSize: {
      type: String,
      trim: true,
      default: ''
    },
    featuredImage: {
      type: String,
      default: ''
    },
    images: {
      type: [String],
      default: []
    },
    specifications: [specificationSchema],
    attributes: [attributeSchema],
    status: {
      type: String,
      enum: ['published', 'draft', 'archived'],
      default: 'published',
      index: true
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true
    },
    seoTitle: {
      type: String,
      trim: true,
      default: ''
    },
    seoDescription: {
      type: String,
      trim: true,
      default: ''
    },
    canonicalUrl: {
      type: String,
      trim: true,
      default: ''
    },
    publishedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

productSchema.pre('validate', function (next) {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }

  // Auto-clean empty specifications and attributes to prevent validation issues
  if (Array.isArray(this.specifications)) {
    this.specifications = this.specifications.filter(
      (s) => s && typeof s.key === 'string' && s.key.trim() && typeof s.value === 'string' && s.value.trim()
    );
  }

  if (Array.isArray(this.attributes)) {
    this.attributes = this.attributes.filter(
      (a) => a && typeof a.name === 'string' && a.name.trim() && typeof a.value === 'string' && a.value.trim()
    );
  }

  next();
});

// Text index for search
productSchema.index({ name: 'text', description: 'text', shortDescription: 'text' });

export const Product = mongoose.model('Product', productSchema);
