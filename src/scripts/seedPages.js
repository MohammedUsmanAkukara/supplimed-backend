import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Page } from '../models/Page.js';

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB });
  console.log('Connected to MongoDB');

  const pagesToUpsert = [
    {
      title: 'Official Product Catalogues & Brochures',
      slug: 'brochures',
      pageType: 'brochures',
      heroHeading: 'Supplimed Product Brochures & Catalogues',
      heroDescription: 'Access certified product specifications, color-coding protocols, draw volume tables, and clinical labware literature. Download instant digital copies or request printed copies for your facility.',
      heroImage: '',
      callToActionText: 'Request Printed Catalogue',
      callToActionUrl: '#request-printed',
      seoTitle: 'Official Product Catalogues & Technical Brochures | Supplimed',
      seoDescription: 'Download Supplimed official product brochures, vacuum blood collection tube technical guides, and ISO 13485 manufacturing compliance portfolios.',
      sections: {
        tagline: 'Official Technical Literature',
        metric1_value: '5+',
        metric1_label: 'Official Catalogues',
        metric2_value: 'ISO 13485',
        metric2_label: 'Certified Portfolio',
        metric3_value: '100% Free',
        metric3_label: 'Instant Download',
        metric4_value: 'Global',
        metric4_label: 'Distributor Access'
      },
      status: 'published',
      showInNavigation: true,
      displayOrder: 5
    },
    {
      title: 'Quality & Regulatory Certificates',
      slug: 'certificates',
      pageType: 'certificates',
      heroHeading: 'Quality Assurance & Regulatory Accreditations',
      heroDescription: 'Every vacuum blood collection tube, specimen container, and diagnostic device from Supplimed is manufactured under strict ISO 13485:2016 and CDSCO quality standards.',
      heroImage: '',
      callToActionText: 'Verify Certification',
      callToActionUrl: '#certificates-list',
      seoTitle: 'Quality & Regulatory Certificates | ISO 13485:2016 Certified Medical Devices',
      seoDescription: 'Explore Supplimed\'s ISO 13485:2016, ISO 9001:2015, CDSCO, and CE certifications ensuring clinical safety and diagnostic precision.',
      sections: {
        tagline: 'Certified Medical Manufacturing',
        stat1_value: 'ISO 13485',
        stat1_label: 'Medical Device QMS',
        stat2_value: 'ISO 9001',
        stat2_label: 'Quality Systems',
        stat3_value: 'CDSCO',
        stat3_label: 'Govt. Manufacturing MD-5',
        stat4_value: 'Class 100k',
        stat4_label: 'Cleanroom Standard',
        qualityPledge: 'Complete Certificate of Analysis (COA) for endotoxin limits, sterility assurance (SAL 10⁻⁶), and chemical assay provided with every hospital shipment.'
      },
      status: 'published',
      showInNavigation: true,
      displayOrder: 6
    }
  ];

  for (const p of pagesToUpsert) {
    const existing = await Page.findOne({ slug: p.slug });
    if (!existing) {
      const created = await Page.create(p);
      console.log('Created page:', created.title, 'slug:', created.slug);
    } else {
      await Page.updateOne({ slug: p.slug }, { $set: p });
      console.log('Updated page:', p.title, 'slug:', p.slug);
    }
  }

  const allPages = await Page.find({}, 'title slug pageType status').lean();
  console.log('All pages in DB:', allPages);
  await mongoose.disconnect();
}

seed().catch(console.error);
