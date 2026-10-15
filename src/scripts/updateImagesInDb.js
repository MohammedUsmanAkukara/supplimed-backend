import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { connectDB } from '../config/db.js';
import { Product } from '../models/Product.js';
import { Page } from '../models/Page.js';
import { Media } from '../models/Media.js';

async function run() {
  try {
    await connectDB();
    console.log('[Images] Connected to DB.');

    // 1. Update Products with real medical images
    const productUpdates = [
      {
        slug: 'hemovac-plus-k2edta-k3edta',
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg', '/images/rd-lab.jpg', '/images/hero-lab.jpg']
      },
      {
        slug: 'hemovac-plus-fluoride',
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg', '/images/rd-lab.jpg']
      },
      {
        slug: 'hemo-tube-clot-activator',
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg', '/images/cleanroom.jpg']
      },
      {
        slug: 'hemo-porter-cool-case',
        featuredImage: '/images/hemo-porter.jpg',
        images: ['/images/hemo-porter.jpg', '/images/hero-lab.jpg']
      },
      {
        slug: 'hemovac-plus-urine-container',
        featuredImage: '/images/hemo-porter.jpg',
        images: ['/images/hemo-porter.jpg', '/images/centrifuge.jpg']
      },
      {
        slug: 'centrifuge-tubes-15ml-50ml',
        featuredImage: '/images/centrifuge.jpg',
        images: ['/images/centrifuge.jpg', '/images/rd-lab.jpg']
      }
    ];

    for (const update of productUpdates) {
      const res = await Product.updateOne(
        { slug: update.slug },
        { 
          $set: { 
            featuredImage: update.featuredImage, 
            images: update.images 
          } 
        }
      );
      console.log(`[Images] Updated product ${update.slug}: ${res.modifiedCount} modified.`);
    }

    // 2. Update Home Page and About Page
    await Page.updateOne(
      { slug: 'home' },
      { 
        $set: { 
          heroImage: '/images/hero-lab.jpg',
          featuredImage: '/images/cleanroom.jpg'
        } 
      }
    );
    console.log('[Images] Updated Home page hero & featured images.');

    await Page.updateOne(
      { slug: 'about' },
      { 
        $set: { 
          heroImage: '/images/cleanroom.jpg',
          featuredImage: '/images/rd-lab.jpg'
        } 
      }
    );
    console.log('[Images] Updated About page hero & featured images.');

    // 3. Seed real images into Media collection for Admin Media Library & Gallery
    const mediaItems = [
      {
        originalName: 'Automated Cleanroom Line',
        storageKey: 'cleanroom.jpg',
        url: '/images/cleanroom.jpg',
        provider: 'local',
        mimeType: 'image/jpeg',
        altText: 'World-Class Automated Cleanroom Production Line',
        caption: 'State-of-the-art Nordson and Jannome robotic lines in our Pune manufacturing facility.',
        category: 'facilities'
      },
      {
        originalName: 'HemoVac Plus Vacuum Tubes',
        storageKey: 'tubes.jpg',
        url: '/images/tubes.jpg',
        provider: 'local',
        mimeType: 'image/jpeg',
        altText: 'HemoVac Plus Vacuum Blood Collection Tubes',
        caption: 'Precision spray-coated K2EDTA and Fluoride tubes compatible with automated analyzers.',
        category: 'products'
      },
      {
        originalName: 'Diagnostic R&D and Quality Testing Lab',
        storageKey: 'rd-lab.jpg',
        url: '/images/rd-lab.jpg',
        provider: 'local',
        mimeType: 'image/jpeg',
        altText: 'SuppliMed In-House Diagnostic Quality Assurance Lab',
        caption: 'Rigorous pneumatic leak testing and chemical stability assays under ISO 13485 standards.',
        category: 'lab'
      },
      {
        originalName: 'Hemo Porter Cool Specimen Cooler',
        storageKey: 'hemo-porter.jpg',
        url: '/images/hemo-porter.jpg',
        provider: 'local',
        mimeType: 'image/jpeg',
        altText: 'Specimen Transport Box with Temperature Indicators',
        caption: 'Integrated phase-change cooling gels ensuring 2-8°C sample stability during transit.',
        category: 'products'
      },
      {
        originalName: 'Centrifuge Tubes and General Labware',
        storageKey: 'centrifuge.jpg',
        url: '/images/centrifuge.jpg',
        provider: 'local',
        mimeType: 'image/jpeg',
        altText: 'Sterile Polypropylene Graduated Centrifuge Tubes',
        caption: 'Capable of withstanding up to 12,000 RCF with leak-proof flat closure caps.',
        category: 'products'
      },
      {
        originalName: 'Clinical Diagnostic Equipment Bench',
        storageKey: 'hero-lab.jpg',
        url: '/images/hero-lab.jpg',
        provider: 'local',
        mimeType: 'image/jpeg',
        altText: 'Automated Clinical Diagnostic Lab Environment',
        caption: 'Modern clinical laboratory setup with computerized diagnostic analysis systems.',
        category: 'lab'
      }
    ];

    for (const item of mediaItems) {
      await Media.findOneAndUpdate(
        { url: item.url },
        { $set: item },
        { upsert: true, new: true }
      );
    }
    console.log('[Images] Populated Media collection with 6 high-res medical assets.');

    console.log('[Images] All database updates completed successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Images] Error updating images:', err);
    process.exit(1);
  }
}

run();
