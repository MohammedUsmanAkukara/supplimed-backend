import mongoose from 'mongoose';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Page } from '../models/Page.js';
import { Setting } from '../models/Setting.js';
import { Navigation } from '../models/Navigation.js';
import { Certificate } from '../models/Certificate.js';
import { connectDB, closeDB } from '../config/db.js';

export async function seedInitialData() {
  console.log('[Seed] Connecting to MongoDB to initialize data...');
  await connectDB();

  try {
    // 1. Seed Categories
    console.log('[Seed] Seeding categories...');
    const categoriesData = [
      {
        name: 'Vacuum Blood Collection Tubes',
        slug: 'vacuum-tubes',
        description: 'ISO-certified vacuum blood collection tubes engineered with advanced spray-coating technology.',
        displayOrder: 1,
        status: 'published'
      },
      {
        name: 'Non Vacuum Tubes',
        slug: 'non-vacuum-tubes',
        description: 'Precision non-vacuum blood collection tubes with unique click-lock closure systems.',
        displayOrder: 2,
        status: 'published'
      },
      {
        name: 'Sample Transport',
        slug: 'sample-transport',
        description: 'Innovative specimen transport boxes, Hemo Porter cool cases, and leak-proof containers.',
        displayOrder: 3,
        status: 'published'
      },
      {
        name: 'General Lab-wares',
        slug: 'lab-wares',
        description: 'Sterilized centrifuge tubes, pipettes, and clinical diagnostic consumables.',
        displayOrder: 4,
        status: 'published'
      },
      {
        name: 'Histopathology',
        slug: 'histopathology',
        description: 'Embedding cassettes, biopsy rings, and tissue processing consumables.',
        displayOrder: 5,
        status: 'published'
      }
    ];

    const categoryMap = {};
    for (const cat of categoriesData) {
      let existing = await Category.findOne({ slug: cat.slug });
      if (!existing) {
        existing = await Category.create(cat);
        console.log(`[Seed] Created category: ${cat.name}`);
      }
      categoryMap[cat.slug] = existing._id;
    }

    // 2. Seed Products
    console.log('[Seed] Seeding products...');
    const productsData = [
      {
        name: 'HemoVac Plus K2EDTA & K3EDTA',
        slug: 'hemovac-plus-k2edta-k3edta',
        sku: 'HVP-EDTA-01',
        category: categoryMap['vacuum-tubes'],
        shortDescription: 'Vacuum Blood collection tube from 1.0 to 10 mL volume of draw. Compatible with automation systems.',
        description: 'The HemoVac Plus K2EDTA and K3EDTA tubes feature precision spray-coating of anticoagulant on the inner walls. Manufactured in our ISO 13485:2016 certified facility, they ensure thorough mixing, accurate complete blood counts (CBC), and automated analyzer compatibility without micro-clot formation.',
        packSize: 'Case of 1200',
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg', '/images/rd-lab.jpg', '/images/hero-lab.jpg'],
        specifications: [
          { key: 'Material', value: 'Medical-grade PET / Polypropylene' },
          { key: 'Draw Volume', value: '1.0 mL to 10.0 mL' },
          { key: 'Additive', value: 'K2EDTA / K3EDTA spray coated' },
          { key: 'Closure Type', value: 'Safety Hemogard / Rubber stopper' },
          { key: 'Shelf Life', value: '18 months from manufacturing' }
        ],
        attributes: [
          { name: 'Sterility', value: 'Gamma Sterilized' },
          { name: 'Analyzer Compatibility', value: 'Nordson & Jannome automation validated' }
        ],
        isFeatured: true,
        displayOrder: 1,
        status: 'published'
      },
      {
        name: 'HemoVac Plus Fluoride',
        slug: 'hemovac-plus-fluoride',
        sku: 'HVP-FLU-02',
        category: categoryMap['vacuum-tubes'],
        shortDescription: 'Fluoride vacuum Blood collection tube from 1.0 to 10 mL volume of draw with unique spray coating.',
        description: 'Specifically engineered for accurate blood glucose and lactate determinations. The sodium fluoride and potassium oxalate formulation rapidly halts glycolysis for up to 48 hours at room temperature, safeguarding clinical diagnostic accuracy.',
        packSize: 'Case of 1200',
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg', '/images/rd-lab.jpg'],
        specifications: [
          { key: 'Draw Volume', value: '2.0 mL to 5.0 mL' },
          { key: 'Additive', value: 'Sodium Fluoride + Potassium Oxalate' },
          { key: 'Cap Color', value: 'Grey' }
        ],
        attributes: [
          { name: 'Application', value: 'Glucose & Lactate testing' }
        ],
        isFeatured: true,
        displayOrder: 2,
        status: 'published'
      },
      {
        name: 'Hemo Tube Clot Activator',
        slug: 'hemo-tube-clot-activator',
        sku: 'HT-CLOT-03',
        category: categoryMap['non-vacuum-tubes'],
        shortDescription: 'Non Vacuum Blood Collection Tubes with unique click lock system. 1 to 4mL volume of draw.',
        description: 'Featuring silica particulate spray coating for rapid and clean clotting within 20-30 minutes. The leak-proof click lock mechanism protects laboratory technicians and eliminates aerosol contamination during centrifugation.',
        packSize: 'Case of 1800',
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg', '/images/cleanroom.jpg'],
        specifications: [
          { key: 'Draw Volume', value: '1.0 mL to 4.0 mL' },
          { key: 'Closure', value: 'Patented Click Lock' },
          { key: 'Clotting Time', value: '20 - 30 minutes' }
        ],
        attributes: [
          { name: 'Type', value: 'Non-Vacuum Microtainer' }
        ],
        isFeatured: true,
        displayOrder: 3,
        status: 'published'
      },
      {
        name: 'Hemo Porter Cool Case',
        slug: 'hemo-porter-cool-case',
        sku: 'HP-COOL-04',
        category: categoryMap['sample-transport'],
        shortDescription: 'Innovative transport box with temperature indicator and integrated cooling gel to extend sample stability.',
        description: 'Designed specifically for phlebotomy route collections and inter-facility specimen transport. The insulated body with customized phase-change coolant packs maintains 2-8°C stability for up to 12 hours, complete with an external temperature gauge.',
        packSize: 'Case of 6',
        featuredImage: '/images/hemo-porter.jpg',
        images: ['/images/hemo-porter.jpg', '/images/hero-lab.jpg'],
        specifications: [
          { key: 'Holding Capacity', value: '60 blood collection tubes + urine containers' },
          { key: 'Cooling Retention', value: 'Up to 12 hours at 2-8°C' },
          { key: 'Indicator', value: 'Built-in digital/strip thermal sensor' }
        ],
        attributes: [
          { name: 'Durability', value: 'High-impact polymer shell' }
        ],
        isFeatured: true,
        displayOrder: 4,
        status: 'published'
      },
      {
        name: 'HemoVac Plus Urine Container',
        slug: 'hemovac-plus-urine-container',
        sku: 'HVP-URINE-05',
        category: categoryMap['sample-transport'],
        shortDescription: 'Closed system Urine Container (50mL/60mL) to reduce sample contamination. Leak tested.',
        description: 'Hermetically sealed urine specimen containers with integrated vacuum transfer ports. Allows direct tube suction without removing the lid, eliminating spills and chemical exposure for healthcare staff.',
        packSize: 'Case of 200',
        featuredImage: '/images/hemo-porter.jpg',
        images: ['/images/hemo-porter.jpg', '/images/centrifuge.jpg'],
        specifications: [
          { key: 'Capacity', value: '50 mL / 60 mL graduated' },
          { key: 'Cap', value: 'Integrated sampling port with puncture cannula' }
        ],
        attributes: [
          { name: 'Testing', value: '100% pneumatic leak tested' }
        ],
        isFeatured: false,
        displayOrder: 5,
        status: 'published'
      },
      {
        name: 'Centrifuge Tubes',
        slug: 'centrifuge-tubes-15ml-50ml',
        sku: 'CT-GRAD-06',
        category: categoryMap['lab-wares'],
        shortDescription: '15mL and 50mL conical tubes with clear graduations. Leak proof and non-slip closure.',
        description: 'High-clarity polypropylene centrifuge tubes capable of withstanding up to 12,000 RCF. Features silk-screened volumetric graduations, large frosted writing surface, and flat leak-proof screw caps.',
        packSize: 'Case of 500 - 2000',
        featuredImage: '/images/centrifuge.jpg',
        images: ['/images/centrifuge.jpg', '/images/rd-lab.jpg'],
        specifications: [
          { key: 'Volumes', value: '15 mL and 50 mL conical bottom' },
          { key: 'Max RCF', value: '12,000 x g' },
          { key: 'Temperature', value: '-80°C to +121°C (Autoclavable)' }
        ],
        attributes: [
          { name: 'Certification', value: 'RNase / DNase / Pyrogen Free' }
        ],
        isFeatured: false,
        displayOrder: 6,
        status: 'published'
      }
    ];

    for (const prod of productsData) {
      const existing = await Product.findOne({ slug: prod.slug });
      if (!existing) {
        await Product.create(prod);
        console.log(`[Seed] Created product: ${prod.name}`);
      } else {
        await Product.updateOne({ slug: prod.slug }, { $set: { featuredImage: prod.featuredImage, images: prod.images } });
      }
    }

    // 3. Seed CMS Pages
    console.log('[Seed] Seeding dynamic pages...');
    const pagesData = [
      {
        title: 'Home',
        slug: 'home',
        pageType: 'home',
        heroHeading: 'Precision Equipment for Modern Diagnostics.',
        heroDescription: 'Elevate your laboratory\'s accuracy with our ISO-certified Vacuum Blood Collection Tubes, Sample Transport Coolers, and premium General Lab-wares.',
        heroImage: '/images/hero-lab.jpg',
        featuredImage: '/images/cleanroom.jpg',
        callToActionText: 'Explore Catalogue',
        callToActionUrl: '/products',
        seoTitle: 'Supplimed | Precision Diagnostic Equipment & Laboratory Consumables',
        seoDescription: 'Supplimed provides world-class diagnostic equipment, vacuum blood collection tubes, and modern lab wares with ISO 13485:2016 certification.',
        status: 'published'
      },
      {
        title: 'About SuppliMed',
        slug: 'about',
        pageType: 'about',
        heroHeading: 'About SuppliMed',
        heroDescription:
          'SuppliMed, based in Pune, is dedicated to protecting and improving lives. For over a decade, we have been a leading provider of in-vitro diagnostic (IVD) reagents, CSSD consumables, and blood bank consumables, serving customers nationwide.',
        heroImage: '/images/cleanroom.jpg',
        featuredImage: '/images/rd-lab.jpg',
        sections: {
          tagline: 'Preserving human lives by promoting healthcare through technology and innovation.',
          intro:
            'SuppliMed, based in Pune, is dedicated to protecting and improving lives. For over a decade, we have been a leading provider of in-vitro diagnostic (IVD) reagents, CSSD consumables, and blood bank consumables, serving customers nationwide.',
          journey: {
            title: 'Our Journey',
            paragraphs: [
              'We began as a diagnostic reagent business. Over the years, we have grown into a fully integrated hospital consumables company, adding CSSD and blood bank consumables to our portfolio. This allows hospitals, laboratories, and blood banks to source the products they depend on from one trusted partner.',
              'Today, SuppliMed operates from world-class facilities, backed by a well-developed in-house Research and Development team that keeps our products and services moving forward.'
            ]
          },
          whatWeDo: {
            title: 'What We Do',
            items: [
              {
                title: 'Diagnostic Reagents',
                description: 'Dependable IVD reagents that support accurate, timely clinical decisions.'
              },
              {
                title: 'CSSD Consumables',
                description: 'Sterilisation and processing consumables that help hospitals maintain the highest standards of infection control.'
              },
              {
                title: 'Blood Bank Consumables',
                description: 'Products that support the safe collection, testing and management of blood.'
              }
            ]
          },
          reach: {
            title: 'Our Reach',
            description:
              'From Pune, and through our trusted vendors and regional warehouse facilities, we serve customers Pan-India, backed by an experienced team and a dedicated support and technical team.'
          },
          vision: {
            title: 'Our Vision',
            description:
              'We aim to be the future leader in the healthcare industry, providing the best products and services to doctors and patients so that healthcare can meet the needs of our population more efficiently.'
          }
        },
        seoTitle: 'About SuppliMed | Diagnostic Reagents, CSSD & Blood Bank Consumables',
        seoDescription:
          'SuppliMed, based in Pune, is dedicated to protecting and improving lives. Leading provider of in-vitro diagnostic (IVD) reagents, CSSD consumables, and blood bank consumables serving Pan-India.',
        status: 'published'
      },
      {
        title: 'Contact Us',
        slug: 'contact',
        pageType: 'contact',
        heroHeading: 'Partner with Supplimed.',
        heroDescription: 'Contact our specialized team for bulk orders, wholesale pricing, or technical inquiries regarding our ISO-certified medical consumables.',
        seoTitle: 'Contact Us | Enquiry & Support | Supplimed',
        seoDescription: 'Get in touch with Supplimed for bulk orders, custom diagnostic equipment manufacturing, and laboratory consumable supplies.',
        status: 'published'
      },
      {
        title: 'Products',
        slug: 'products',
        pageType: 'products',
        heroHeading: 'Diagnostic Products & Medical Consumables.',
        heroDescription: 'Explore our complete range of ISO-certified laboratory equipment engineered for precise and accurate results.',
        seoTitle: 'Diagnostic Products & Consumables | Supplimed',
        seoDescription: 'Browse our comprehensive range of diagnostic equipment including Vacuum Tubes, Hemo Porter Cool Case, and ISO-certified Lab-wares.',
        status: 'published'
      },
      {
        title: 'Official Product Catalogues & Brochures',
        slug: 'brochures',
        pageType: 'brochures',
        heroHeading: 'Supplimed Product Brochures & Catalogues',
        heroDescription:
          'Access certified product specifications, color-coding protocols, draw volume tables, and clinical labware literature. Download instant digital copies or request printed copies for your facility.',
        callToActionText: 'Request Printed Catalogue',
        callToActionUrl: '#request-printed',
        seoTitle: 'Official Product Catalogues & Technical Brochures | Supplimed',
        seoDescription:
          'Download Supplimed official product brochures, vacuum blood collection tube technical guides, and ISO 13485 manufacturing compliance portfolios.',
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
        status: 'published'
      },
      {
        title: 'Quality & Regulatory Certificates',
        slug: 'certificates',
        pageType: 'certificates',
        heroHeading: 'Quality Assurance & Regulatory Accreditations',
        heroDescription:
          'Every vacuum blood collection tube, specimen container, and diagnostic device from Supplimed is manufactured under strict ISO 13485:2016 and CDSCO quality standards.',
        callToActionText: 'Verify Certification',
        callToActionUrl: '#certificates-list',
        seoTitle: 'Quality & Regulatory Certificates | ISO 13485:2016 Certified Medical Devices',
        seoDescription:
          'Explore Supplimed\'s ISO 13485:2016, ISO 9001:2015, CDSCO, and CE certifications ensuring clinical safety and diagnostic precision.',
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
          qualityPledge:
            'Complete Certificate of Analysis (COA) for endotoxin limits, sterility assurance (SAL 10⁻⁶), and chemical assay provided with every hospital shipment.'
        },
        status: 'published'
      }
    ];

    for (const page of pagesData) {
      const existing = await Page.findOne({ slug: page.slug });
      if (!existing) {
        await Page.create(page);
        console.log(`[Seed] Created page: ${page.title}`);
      } else {
        await Page.updateOne({ slug: page.slug }, { $set: page });
        console.log(`[Seed] Updated page: ${page.title}`);
      }
    }

    // 4. Seed Global Settings
    console.log('[Seed] Seeding global settings...');
    let settings = await Setting.findOne({ key: 'global_settings' });
    if (!settings) {
      settings = await Setting.create({
        key: 'global_settings',
        websiteName: 'Supplimed',
        websiteTitle: 'Supplimed | Diagnostic Equipment Manufacturer',
        tagline: 'Where Need Connects Satisfaction',
        logo: '/logo.png',
        alternateLogo: '/logo.png',
        favicon: '/favicon.svg',
        themeColor: '#A3C065',
        contactEmail: 'sales@supplimed.in',
        contactPhone: '+91 (123) 456-7890',
        address: 'Pune, Maharashtra & Noida, India',
        defaultSeoTitle: 'Supplimed | Diagnostic Products & Medical Equipment Supplier in Pune',
        defaultMetaDescription: 'Find ISO-certified diagnostic products, vacuum blood collection tubes, sample transport coolers, and pathology lab supplies in Pune. Certified manufacturer and medical supplier across Pune, Maharashtra.',
        defaultKeywords: 'diagnostic products Pune, medical equipment supplier Pune, vacuum blood collection tubes Pune, pathology lab supplies Pune, laboratory consumables Pune Maharashtra, blood collection tubes dealer Pune, HemoVac Pune, hospital supplies Pune, supplimed'
      });
      console.log('[Seed] Created default global settings');
    }

    // 5. Seed Certificates
    console.log('[Seed] Seeding certificates...');
    const certificatesData = [
      {
        title: 'ISO 13485:2016 Medical Devices Quality Management System',
        certificateNumber: 'SUP-ISO13485-9824',
        issuingBody: 'TÜV Rheinland / CDSCO Accredited Registrar',
        category: 'Medical Device Quality',
        issueDate: new Date('2024-01-10'),
        expiryDate: new Date('2027-01-09'),
        fileUrl: '/images/cert-iso13485.svg',
        fileType: 'image',
        thumbnailUrl: '/images/cert-iso13485.svg',
        description: 'Design, Automated Manufacturing, Cleanroom Packaging, and Global Distribution of Sterile and Non-Sterile In-Vitro Diagnostic Medical Devices including Vacuum Blood Collection Tubes (HemoVac Plus) and Specimen Transport Consumables.',
        status: 'published',
        displayOrder: 1,
        featured: true,
        downloadable: true
      },
      {
        title: 'ISO 9001:2015 Quality Management Systems',
        certificateNumber: 'SUP-ISO9001-4412',
        issuingBody: 'Bureau Veritas / International Accreditation Forum',
        category: 'Quality Management',
        issueDate: new Date('2023-03-15'),
        expiryDate: new Date('2026-03-14'),
        fileUrl: '/images/cert-iso9001.svg',
        fileType: 'image',
        thumbnailUrl: '/images/cert-iso9001.svg',
        description: 'Manufacture, Automated Assembly, Quality Inspection, and Global Supply of Clinical Diagnostic Consumables, Polypropylene Laboratory Containers, and Vacuum Evacuated Specimen Collection Tubes.',
        status: 'published',
        displayOrder: 2,
        featured: true,
        downloadable: true
      },
      {
        title: 'CDSCO Medical Device Manufacturing License (MD-5)',
        certificateNumber: 'CDSCO-MFG-MD5-2024-0089',
        issuingBody: 'Central Drugs Standard Control Organisation (Govt. of India)',
        category: 'Regulatory License',
        issueDate: new Date('2024-05-01'),
        expiryDate: new Date('2029-04-30'),
        fileUrl: '/images/cert-iso13485.svg',
        fileType: 'image',
        thumbnailUrl: '/images/cert-iso13485.svg',
        description: 'Statutory manufacturing license for In-Vitro Diagnostic Medical Devices, Specimen Collection Tubes, and Medical-Grade Laboratory Plastics under Medical Device Rules (MDR 2017).',
        status: 'published',
        displayOrder: 3,
        featured: true,
        downloadable: true
      },
      {
        title: 'CE Mark Declaration of Technical Conformity',
        certificateNumber: 'CE-IVD-98-79-EC',
        issuingBody: 'European Conformity Assessment Body',
        category: 'Product Compliance',
        issueDate: new Date('2023-11-20'),
        expiryDate: new Date('2026-11-19'),
        fileUrl: '/images/cert-iso9001.svg',
        fileType: 'image',
        thumbnailUrl: '/images/cert-iso9001.svg',
        description: 'Compliance with EU In-Vitro Diagnostic Directive 98/79/EC and Regulation (EU) 2017/746 for European healthcare supply.',
        status: 'published',
        displayOrder: 4,
        featured: false,
        downloadable: true
      }
    ];

    for (const cert of certificatesData) {
      const existing = await Certificate.findOne({ certificateNumber: cert.certificateNumber });
      if (!existing) {
        await Certificate.create(cert);
        console.log(`[Seed] Created certificate: ${cert.title}`);
      }
    }

    // 6. Seed Navigation Items
    console.log('[Seed] Seeding navigation items...');
    const navItems = [
      // Header
      { placement: 'header', label: 'Home', url: '/', order: 1 },
      { placement: 'header', label: 'About Us', url: '/about', order: 2 },
      { placement: 'header', label: 'Products', url: '/products', order: 3 },
      { placement: 'header', label: 'Certificates', url: '/certificates', order: 4 },
      { placement: 'header', label: 'Gallery', url: '/gallery', order: 5 },
      { placement: 'header', label: 'Contact', url: '/contact', order: 6 },
      // Footer Company
      { placement: 'footer_company', label: 'About Us', url: '/about', order: 1 },
      { placement: 'footer_company', label: 'Our Products', url: '/products', order: 2 },
      { placement: 'footer_company', label: 'Certificates & ISO', url: '/certificates', order: 3 },
      { placement: 'footer_company', label: 'Facility Gallery', url: '/gallery', order: 4 },
      { placement: 'footer_company', label: 'Contact & Support', url: '/contact', order: 5 },
      // Footer Categories
      { placement: 'footer_categories', label: 'Vacuum Blood Tubes', url: '/products?category=vacuum-tubes', order: 1 },
      { placement: 'footer_categories', label: 'Sample Transport', url: '/products?category=sample-transport', order: 2 },
      { placement: 'footer_categories', label: 'Histopathology', url: '/products?category=histopathology', order: 3 },
      { placement: 'footer_categories', label: 'General Lab-wares', url: '/products?category=lab-wares', order: 4 },
      // Footer Legal
      { placement: 'footer_legal', label: 'Privacy Policy', url: '#privacy', order: 1 },
      { placement: 'footer_legal', label: 'Terms of Service', url: '#terms', order: 2 }
    ];

    for (const item of navItems) {
      const existing = await Navigation.findOne({ placement: item.placement, label: item.label });
      if (!existing) {
        await Navigation.create(item);
      } else if (item.label.includes('Certificate') && existing.url !== '/certificates') {
        existing.url = '/certificates';
        await existing.save();
      }
    }
    console.log('[Seed] Navigation items seeded.');

    console.log('\n[SUCCESS] All initial database content seeded successfully!');
  } catch (error) {
    console.error(`[Seed Error] ${error.message}`);
  } finally {
    await closeDB();
  }
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith('seedInitialData.js')) {
  seedInitialData().then(() => process.exit(0));
}
