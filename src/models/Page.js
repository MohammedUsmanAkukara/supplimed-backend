import mongoose from 'mongoose';
import slugify from 'slugify';

const pageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Page title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    pageType: {
      type: String,
      enum: ['home', 'about', 'contact', 'products', 'custom'],
      default: 'custom',
      index: true
    },
    heroHeading: {
      type: String,
      trim: true,
      default: ''
    },
    heroDescription: {
      type: String,
      trim: true,
      default: ''
    },
    heroImage: {
      type: String,
      default: ''
    },
    featuredImage: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    },
    sections: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    callToActionText: {
      type: String,
      trim: true,
      default: ''
    },
    callToActionUrl: {
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
    showInNavigation: {
      type: Boolean,
      default: true
    },
    displayOrder: {
      type: Number,
      default: 0
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
    openGraphImage: {
      type: String,
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

pageSchema.pre('validate', function (next) {
  if (this.title && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

export const Page = mongoose.model('Page', pageSchema);
