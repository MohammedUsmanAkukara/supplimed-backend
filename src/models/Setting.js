import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'global_settings',
      unique: true
    },
    websiteName: {
      type: String,
      default: 'Supplimed'
    },
    websiteTitle: {
      type: String,
      default: 'Supplimed | Precision Diagnostic Equipment'
    },
    tagline: {
      type: String,
      default: 'Where Need Connects Satisfaction'
    },
    websiteUrl: {
      type: String,
      default: 'https://supplimed-website.vercel.app'
    },
    logo: {
      type: String,
      default: '/logo.png'
    },
    alternateLogo: {
      type: String,
      default: '/logo.png'
    },
    favicon: {
      type: String,
      default: '/favicon.svg'
    },
    themeColor: {
      type: String,
      default: '#A3C065'
    },
    defaultSeoTitle: {
      type: String,
      default: 'Supplimed | Precision Diagnostic Equipment & Laboratory Consumables'
    },
    defaultMetaDescription: {
      type: String,
      default: 'Supplimed is an ISO-certified manufacturer of high-precision diagnostic equipment, Vacuum Blood Collection Tubes, Sample Transport Coolers, and general lab-wares.'
    },
    defaultKeywords: {
      type: String,
      default: 'diagnostic equipment, vacuum tubes, blood collection tubes, hemo porter, lab wares, ISO 13485, supplimed'
    },
    defaultOgImage: {
      type: String,
      default: '/logo.png'
    },
    canonicalBaseUrl: {
      type: String,
      default: 'https://supplimed-website.vercel.app'
    },
    contactEmail: {
      type: String,
      default: 'sales@supplimed.in'
    },
    contactPhone: {
      type: String,
      default: '+91 (123) 456-7890'
    },
    address: {
      type: String,
      default: 'MB Plastic Industries, B75, Sector 83, Noida, UP 201305 INDIA'
    },
    socialLinks: {
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' }
    },
    analytics: {
      googleAnalyticsId: { type: String, default: '' },
      isEnabled: { type: Boolean, default: false }
    },
    maintenanceMode: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export const Setting = mongoose.model('Setting', settingSchema);
