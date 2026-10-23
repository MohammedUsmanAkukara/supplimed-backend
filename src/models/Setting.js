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
      default: 'Supplimed | Diagnostic Products & Medical Equipment Supplier in Pune'
    },
    defaultMetaDescription: {
      type: String,
      default: 'Find ISO-certified diagnostic products, vacuum blood collection tubes, sample transport coolers, and pathology lab supplies in Pune. Certified manufacturer and medical supplier across Pune, Maharashtra.'
    },
    defaultKeywords: {
      type: String,
      default: 'diagnostic products Pune, medical equipment supplier Pune, vacuum blood collection tubes Pune, pathology lab supplies Pune, laboratory consumables Pune Maharashtra, blood collection tubes dealer Pune, HemoVac Pune, hospital supplies Pune, supplimed'
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
    mapIframe: {
      type: String,
      default: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1m2!1s0x390d9d020d0f7aeb%3A0x2f9cb79e7e0b57e7!2sSector%2083%2C%20Noida%2C%20Uttar%20Pradesh%20201305!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin'
    },
    mapTitle: {
      type: String,
      default: 'Supplimed Manufacturing Facility'
    },
    notificationEmail: {
      type: String,
      default: 'sales@supplimed.in'
    },
    smtp: {
      enabled: {
        type: Boolean,
        default: true
      },
      host: {
        type: String,
        default: 'sg2plzcpnl509592.prod.sin2.secureserver.net',
        trim: true
      },
      port: {
        type: Number,
        default: 465
      },
      secure: {
        type: Boolean,
        default: true
      },
      requireTls: {
        type: Boolean,
        default: true
      },
      user: {
        type: String,
        default: 'support@supplimed.in',
        trim: true
      },
      pass: {
        type: String,
        default: '@Hb1t7bbknj',
        trim: true
      },
      fromEmail: {
        type: String,
        default: 'support@supplimed.in',
        trim: true
      },
      fromName: {
        type: String,
        default: 'Supplimed',
        trim: true
      }
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
