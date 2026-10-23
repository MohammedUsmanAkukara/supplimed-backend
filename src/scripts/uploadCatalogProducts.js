import mongoose from 'mongoose';
import { connectDB, closeDB } from '../config/db.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';

export async function uploadCatalogProducts() {
  console.log('[Catalog Upload] Connecting to MongoDB...');
  await connectDB();

  try {
    // 1. Fetch or create categories matching catalog
    const categoryConfigs = [
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
        name: 'Histopathology & Phlebotomy Accessories',
        slug: 'histopathology',
        description: 'Embedding cassettes, biopsy rings, tissue processing consumables, and phlebotomy accessories.',
        displayOrder: 5,
        status: 'published'
      }
    ];

    const categoryMap = {};
    for (const cat of categoryConfigs) {
      let existing = await Category.findOne({ slug: cat.slug });
      if (!existing) {
        existing = await Category.create(cat);
        console.log(`[Category] Created category: ${cat.name}`);
      } else {
        await Category.updateOne({ slug: cat.slug }, { $set: { name: cat.name, description: cat.description } });
      }
      categoryMap[cat.slug] = existing._id;
    }

    // 2. Comprehensive Catalog Products List (Brand MB 2025 Edition Catalogue)
    const catalogProducts = [
      // -------------------------------------------------------------------------
      // SECTION 1: VACUUM BLOOD COLLECTION TUBES (CLOSED SYSTEM)
      // -------------------------------------------------------------------------
      {
        name: 'HemoVac Plus K3EDTA Vacuum Tube',
        slug: 'hemovac-plus-k3edta-vacuum-tube',
        sku: 'VACK3E',
        category: categoryMap['vacuum-tubes'],
        shortDescription: 'Vacuum Blood collection tube from 1.0 to 10 mL volume of draw with K3EDTA spray coating. Compatible with automation.',
        description: 'HemoVac Plus K3EDTA vacuum blood collection tubes are manufactured with high quality raw materials, pharma grade labels, and Exxon Bromobutyl rubbers. Features automated vision-based spray detection to ensure uniform anticoagulant spray coating (1.8mg/mL), eliminating platelet aggregation. Tested and compatible with Roche and Beckman Coulter automation systems.',
        packSize: 'Case of 1200',
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg', '/images/rd-lab.jpg', '/images/cleanroom.jpg'],
        specifications: [
          { key: 'Catalog Number', value: 'VACK3E (Postfix 1-4, 5-6, 7-10)' },
          { key: 'Draw Volumes', value: '1.0-4.0 mL (13x75mm), 5.0-6.0 mL (13x100mm), 7.0-10.0 mL (16x100mm)' },
          { key: 'Additive', value: 'K3 EDTA 1.8mg / mL' },
          { key: 'Tube Material', value: 'Medical-grade PET / Polyethylene' },
          { key: 'Cap Color', value: 'Lavender / Purple' },
          { key: 'Stopper', value: 'Non-Fragmenting Stopper (Probe Compatible)' }
        ],
        attributes: [
          { name: 'Application', value: 'Hematology, CBC, Blood Grouping' },
          { name: 'Barcoding', value: 'Available with Pre-barcoding' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'HemoVac Plus K3EDTA Blood Collection Tubes Supplier Pune',
        seoDescription: 'Buy HemoVac Plus K3EDTA vacuum blood collection tubes in Pune. ISO-certified CBC tubes compatible with Roche & Beckman Coulter analyzers.',
        isFeatured: true,
        displayOrder: 1,
        status: 'published'
      },
      {
        name: 'HemoVac Plus K2EDTA Vacuum Tube',
        slug: 'hemovac-plus-k2edta-vacuum-tube',
        sku: 'VACK2E',
        category: categoryMap['vacuum-tubes'],
        shortDescription: 'Evacuated blood collection tube from 1.0 to 10 mL draw volume with K2EDTA spray coating for hematology.',
        description: 'The HemoVac Plus K2EDTA vacuum tube features precision spray-coating of K2EDTA on the inner walls. Manufactured in an ISO 13485:2016 certified facility, it delivers thorough mixing, accurate complete blood counts (CBC), and automated analyzer compatibility without micro-clot formation.',
        packSize: 'Case of 1200',
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg', '/images/hero-lab.jpg'],
        specifications: [
          { key: 'Catalog Number', value: 'VACK2E (Postfix 1-4, 5-6, 7-10)' },
          { key: 'Draw Volumes', value: '1.0-4.0 mL (13x75mm), 5.0-6.0 mL (13x100mm), 7.0-10.0 mL (16x100mm)' },
          { key: 'Additive', value: 'K2 EDTA 1.8mg / mL' },
          { key: 'Material', value: 'PET / PE' },
          { key: 'Cap Color', value: 'Lavender / Purple' }
        ],
        attributes: [
          { name: 'Application', value: 'Hematology & Molecular Diagnostics' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'HemoVac Plus K2EDTA Vacuum Tubes Supplier in Pune',
        seoDescription: 'Order HemoVac Plus K2EDTA vacuum blood collection tubes in Pune. High-precision spray-coated tubes for hospitals and labs.',
        isFeatured: true,
        displayOrder: 2,
        status: 'published'
      },
      {
        name: 'HemoVac Plus Clot Activator Serum Tube',
        slug: 'hemovac-plus-clot-activator-serum-tube',
        sku: 'VACBCA',
        category: categoryMap['vacuum-tubes'],
        shortDescription: 'Serum determination vacuum tube with micronized silica clot activator for biochemistry and serology.',
        description: 'HemoVac Plus Clot Activator tubes contain micronized silica particles that rapidly trigger blood clotting within 20 to 30 minutes. Ensures clean fibrin separation and high serum yields for clinical chemistry, serology, and immunology testing.',
        packSize: 'Case of 1200',
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg', '/images/rd-lab.jpg'],
        specifications: [
          { key: 'Catalog Number', value: 'VACBCA' },
          { key: 'Draw Volumes', value: '1.0-4.0 mL (13x75mm), 5.0-6.0 mL (13x100mm), 7.0-10.0 mL (16x100mm)' },
          { key: 'Additive', value: 'BCA (Blood Clot Activator)' },
          { key: 'Cap Color', value: 'Red' },
          { key: 'Clotting Time', value: '20-30 minutes' }
        ],
        attributes: [
          { name: 'Application', value: 'Clinical Biochemistry & Serology' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'HemoVac Plus Red Top Clot Activator Tubes Pune',
        seoDescription: 'Buy HemoVac Plus Clot Activator red top tubes in Pune. Rapid serum clotting for pathology and diagnostic laboratories.',
        isFeatured: true,
        displayOrder: 3,
        status: 'published'
      },
      {
        name: 'HemoVac Plus Fluoride Vacuum Tube',
        slug: 'hemovac-plus-fluoride-vacuum-tube',
        sku: 'VACFL',
        category: categoryMap['vacuum-tubes'],
        shortDescription: 'Glucose determination vacuum tube with Sodium Fluoride / EDTA or Oxalate spray coating.',
        description: 'Engineered specifically for blood glucose and lactate determinations. HemoVac Plus Fluoride tubes utilize a unique USA spray coat technology with volumetric accuracy within 5% and repeatability of 99.7%, preventing glycolysis for up to 48 hours.',
        packSize: 'Case of 1200',
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg'],
        specifications: [
          { key: 'Catalog Number', value: 'VACFL (Postfix E1-10 / O1-10)' },
          { key: 'Additive Options', value: 'Sodium Fluoride / EDTA or Sodium Fluoride / Oxalate' },
          { key: 'Draw Volumes', value: '1.0-4.0 mL, 5.0-6.0 mL, 7.0-10.0 mL' },
          { key: 'Cap Color', value: 'Grey' },
          { key: 'Accuracy', value: 'Within 5% volumetric tolerance' }
        ],
        attributes: [
          { name: 'Application', value: 'Blood Sugar & Glucose Tolerance Testing' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'HemoVac Plus Fluoride Glucose Tubes Supplier in Pune',
        seoDescription: 'Procure HemoVac Plus Grey Top Fluoride tubes in Pune for accurate glucose and lactate testing.',
        isFeatured: false,
        displayOrder: 4,
        status: 'published'
      },
      {
        name: 'HemoVac Plus PTT Coagulation Tube (Sodium Citrate 3.2%)',
        slug: 'hemovac-plus-ptt-coagulation-tube',
        sku: 'VACPTT',
        category: categoryMap['vacuum-tubes'],
        shortDescription: 'Vacuum coagulation tube with 3.2% buffered sodium citrate (1:9 ratio) for PT and APTT tests.',
        description: 'HemoVac Plus PTT tubes contain 3.2% (0.109 mol/L) buffered sodium citrate solution for coagulation assays including Prothrombin Time (PT), Activated Partial Thromboplastin Time (APTT), and fibrinogen. Ensures precise blood-to-anticoagulant ratio.',
        packSize: 'Case of 1200',
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg'],
        specifications: [
          { key: 'Catalog Number', value: 'VACPTT' },
          { key: 'Additive', value: 'Sodium Citrate 3.2%' },
          { key: 'Draw Volumes', value: '1.0-4.0 mL (13x75mm), 5.0-6.0 mL (13x100mm), 7.0-10.0 mL (16x100mm)' },
          { key: 'Cap Color', value: 'Light Blue' },
          { key: 'Automation Compatibility', value: 'Roche, Beckman Coulter' }
        ],
        attributes: [
          { name: 'Application', value: 'Coagulation & Hemostasis Studies' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'HemoVac Plus Sodium Citrate 3.2% Blue Top Tubes Pune',
        seoDescription: 'Find HemoVac Plus 3.2% Sodium Citrate Blue Top PTT tubes in Pune. Certified hemostasis testing consumables.',
        isFeatured: false,
        displayOrder: 5,
        status: 'published'
      },
      {
        name: 'HemoVac Plus ESR Tube (Sodium Citrate 3.8%)',
        slug: 'hemovac-plus-esr-tube',
        sku: 'VACESR',
        category: categoryMap['vacuum-tubes'],
        shortDescription: 'Westergren ESR vacuum blood collection tube with 3.8% buffered sodium citrate (1:4 ratio).',
        description: 'Formulated with 3.8% (0.129 mol/L) sodium citrate for Westergren Erythrocyte Sedimentation Rate (ESR) testing. Designed for direct insertion into automated and manual ESR reading racks.',
        packSize: 'Case of 1200',
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg'],
        specifications: [
          { key: 'Catalog Number', value: 'VACESR' },
          { key: 'Additive', value: 'Sodium Citrate 3.8%' },
          { key: 'Draw Volumes', value: '1.0-4.0 mL, 5.0-6.0 mL, 7.0-10.0 mL' },
          { key: 'Cap Color', value: 'Black' }
        ],
        attributes: [
          { name: 'Application', value: 'Erythrocyte Sedimentation Rate' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'HemoVac Plus Black Top ESR Tubes Supplier Pune',
        seoDescription: 'Order HemoVac Plus 3.8% Citrate ESR Black Top tubes in Pune for pathology labs and hospitals.',
        isFeatured: false,
        displayOrder: 6,
        status: 'published'
      },
      {
        name: 'HemoVac Plus SST Gel & Clot Activator Tube',
        slug: 'hemovac-plus-sst-gel-tube',
        sku: 'VACSST',
        category: categoryMap['vacuum-tubes'],
        shortDescription: 'Serum Separator Tube (SST) with inert polymer gel and clot activator for chemistry and serology.',
        description: 'HemoVac Plus SST tubes combine a micronized clot activator with an inert thixotropic polyester gel. Upon centrifugation, the gel forms an impermeable physical barrier between serum and blood clot, maintaining analyte stability for up to 48 hours.',
        packSize: 'Case of 1200',
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg'],
        specifications: [
          { key: 'Catalog Number', value: 'VACSST' },
          { key: 'Draw Volumes', value: '3.5 mL (13x75mm), 5.0 mL (13x100mm), 8.0 mL (16x100mm)' },
          { key: 'Additive', value: 'SST Gel + Blood Clot Activator (BCA)' },
          { key: 'Cap Color', value: 'Yellow / Gold' }
        ],
        attributes: [
          { name: 'Application', value: 'Clinical Chemistry, Immunology, TDM' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'HemoVac Plus Yellow Top SST Gel Tubes Pune',
        seoDescription: 'Buy HemoVac Plus SST Gel Yellow Top vacuum tubes in Pune. High-clarity barrier gel tubes for serum testing.',
        isFeatured: true,
        displayOrder: 7,
        status: 'published'
      },
      {
        name: 'HemoVac Plus Heparin Tube (Lithium & Sodium)',
        slug: 'hemovac-plus-heparin-tube',
        sku: 'VAC-LH-SH',
        category: categoryMap['vacuum-tubes'],
        shortDescription: 'Ethanol-free additive heparin vacuum tube for emergency biochemistry and plasma determinations.',
        description: 'HemoVac Plus Heparin tubes feature an ethanol-free additive preparation that prevents specimen hemolysis during collection. Spray coated with lithium or sodium heparin on inner walls. Available in single and double wall configurations.',
        packSize: 'Case of 1200',
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg'],
        specifications: [
          { key: 'Catalog Number', value: 'VAC LH / VAC SH' },
          { key: 'Additive', value: 'Lithium Heparin / Sodium Heparin' },
          { key: 'Draw Volumes', value: '1.0-4.0 mL, 5.0-6.0 mL, 7.0-10.0 mL' },
          { key: 'Cap Color', value: 'Green' },
          { key: 'Features', value: 'Ethanol-free formulation, Double wall available' }
        ],
        attributes: [
          { name: 'Application', value: 'Plasma Biochemistry & Electrolytes' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'HemoVac Plus Green Top Heparin Tubes Pune',
        seoDescription: 'Find HemoVac Plus Lithium & Sodium Heparin Green Top tubes in Pune for stat clinical chemistry testing.',
        isFeatured: false,
        displayOrder: 8,
        status: 'published'
      },
      {
        name: 'HemoVac Plus Evacuated Urine Tube',
        slug: 'hemovac-plus-evacuated-urine-tube',
        sku: 'VACUA',
        category: categoryMap['vacuum-tubes'],
        shortDescription: 'Vacuum urine collection tube with Boric Acid / Sodium Formate preservative or plain.',
        description: 'Closed-system evacuated urine tubes designed for routine urinalysis and microbiological culture. Compatible with automated urine chemistry strips and sediment analyzers.',
        packSize: 'Case of 1200',
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg'],
        specifications: [
          { key: 'Catalog Number', value: 'VACUA (Postfix PRE / PLA)' },
          { key: 'Draw Volumes', value: '1.0 - 10.0 mL (75mm / 100mm)' },
          { key: 'Additive', value: 'Boric Acid / Sodium Formate or No Additive' },
          { key: 'Material', value: 'PET / PE' }
        ],
        attributes: [
          { name: 'Application', value: 'Urinalysis & Urine Culture' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'HemoVac Plus Evacuated Urine Tubes Supplier Pune',
        seoDescription: 'Buy HemoVac Plus vacuum urine collection tubes in Pune. Preservative and plain tubes for labs.',
        isFeatured: false,
        displayOrder: 9,
        status: 'published'
      },
      {
        name: 'Hemo Mini Paediatric Blood Collection Tubes',
        slug: 'hemo-mini-paediatric-blood-collection-tubes',
        sku: 'MINI-SERIES',
        category: categoryMap['vacuum-tubes'],
        shortDescription: 'Self-standing 0.5mL - 1.0mL paediatric blood collection tubes with screw cap and centrifuge base.',
        description: 'Hemo Mini is an innovative paediatric product from MB. Engineered for micro-sampling from infants and neonatal patients. Each self-standing tube includes a detachable extended base allowing them to fit directly into standard lab centrifuges.',
        packSize: 'Case of 1200',
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg', '/images/rd-lab.jpg'],
        specifications: [
          { key: 'Catalog Numbers', value: 'MINIK3E, MINIK2E, MINIBCA, MINIFL, MINILH, MINISH' },
          { key: 'Volume', value: '0.5 mL - 1.0 mL' },
          { key: 'Material', value: 'Polypropylene (PP)' },
          { key: 'Variants', value: 'K3EDTA, K2EDTA, Serum BCA, Fluoride, Lithium Heparin, Sodium Heparin' },
          { key: 'Design', value: 'Self-standing with removable centrifuge base adapter' }
        ],
        attributes: [
          { name: 'Application', value: 'Neonatal & Paediatric Phlebotomy' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'Hemo Mini Paediatric Blood Collection Tubes Pune',
        seoDescription: 'Buy Hemo Mini 0.5ml-1ml paediatric blood collection tubes with centrifuge adapters in Pune.',
        isFeatured: true,
        displayOrder: 10,
        status: 'published'
      },
      {
        name: 'HemoVac Plus Speciality Tubes (ACD & PRP Gel)',
        slug: 'hemovac-plus-speciality-tubes',
        sku: 'VACSPL',
        category: categoryMap['vacuum-tubes'],
        shortDescription: 'Evacuated blood collection tubes for blood banking ACD preservation and Platelet-Rich Plasma (PRP) therapy.',
        description: 'Speciality blood collection tubes manufactured with ultra-clean medical grade polymers. Formulations include ACD-A / ACD-B for immunohematology preservation, and PRP gel separation tubes with or without Biotin for regenerative medicine.',
        packSize: 'Case of 1200',
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg'],
        specifications: [
          { key: 'Catalog Numbers', value: 'VACSPL (ACD, ACDG, AACDGB)' },
          { key: 'Draw Volume', value: '8.0 mL - 8.5 mL' },
          { key: 'Additives', value: 'ACD - A / ACD - B / ACD + PRP GEL / ACD + PRP GEL + Biotin' },
          { key: 'Cap Color', value: 'Yellow / Light Blue Specialty' }
        ],
        attributes: [
          { name: 'Application', value: 'PRP Preparation & Blood Banking' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'HemoVac Plus ACD & PRP Gel Tubes Supplier Pune',
        seoDescription: 'Find HemoVac Plus ACD and PRP Gel tubes in Pune for regenerative medicine and blood banking.',
        isFeatured: false,
        displayOrder: 11,
        status: 'published'
      },
      {
        name: 'Multi Sample & Flash Back Blood Collection Needles',
        slug: 'multi-sample-flash-back-needles',
        sku: 'MSN-FBN',
        category: categoryMap['vacuum-tubes'],
        shortDescription: 'Precision sterile blood collection needles with flash back chamber for immediate vein confirmation.',
        description: 'Ultra-sharp triple-bevel siliconized blood collection needles designed for smooth, painless venipuncture. Flash Back Needles feature a transparent translucent hub for instant visual confirmation of vein entry.',
        packSize: 'Case of 2000',
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg'],
        specifications: [
          { key: 'Multi Sample Needles', value: 'MSN2110 (21Gx1"), MSN2115 (21Gx1.5"), MSN2210 (22Gx1"), MSN2215 (22Gx1.5")' },
          { key: 'Flash Back Needles', value: 'FBN2110 (21Gx1"), FBN2115 (21Gx1.5"), FBN2210 (22Gx1"), FBN2215 (22Gx1.5")' },
          { key: 'Sterility', value: 'EO Sterile Individually Sealed' }
        ],
        attributes: [
          { name: 'Feature', value: 'Visual Vein Entry Confirmation' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'Multi Sample & Flash Back Phlebotomy Needles Pune',
        seoDescription: 'Buy multi-sample and flashback blood collection needles in Pune. Precision 21G and 22G sterile needles.',
        isFeatured: false,
        displayOrder: 12,
        status: 'published'
      },
      {
        name: 'Safe Eject Auto Release Needle Holder',
        slug: 'safe-eject-auto-release-needle-holder',
        sku: 'MBSENH',
        category: categoryMap['vacuum-tubes'],
        shortDescription: 'Safety needle holder with one-touch push button needle ejection to eliminate needle stick injuries.',
        description: 'The Safe Eject Auto Release Needle Holder provides superior safety for phlebotomists. It completely eliminates the need to recap or manually unscrew contaminated needles post-blood draw, reducing accidental needle-stick injuries by 99%.',
        packSize: 'Case of 2000',
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg'],
        specifications: [
          { key: 'Catalog Number', value: 'MBSENH' },
          { key: 'Tube Compatibility', value: '13x75 mm, 13x100 mm, 16x100 mm' },
          { key: 'Material', value: 'Clear Medical Grade Polypropylene' },
          { key: 'Mechanism', value: 'Quick-release trigger button' }
        ],
        attributes: [
          { name: 'Safety Compliance', value: 'OSHA Needle Stick Prevention' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'Safe Eject Auto Release Needle Holders Pune',
        seoDescription: 'Order Safe Eject needle holders in Pune. One-touch needle release preventing sharps injuries in hospitals.',
        isFeatured: false,
        displayOrder: 13,
        status: 'published'
      },

      // -------------------------------------------------------------------------
      // SECTION 2: NON VACUUM BLOOD COLLECTION TUBES (OPEN SYSTEM)
      // -------------------------------------------------------------------------
      {
        name: 'Hemo Tube K3EDTA Non Vacuum Tube',
        slug: 'hemo-tube-k3edta-non-vacuum-tube',
        sku: 'HTK3E',
        category: categoryMap['non-vacuum-tubes'],
        shortDescription: 'Non-vacuum blood collection tube from 1.0 to 10 mL with unique Click Lock closure and K3EDTA.',
        description: 'Brand Hemo Tube open system non-vacuum blood collection tubes engineered with our unique Click Lock closure mechanism. Spray coated with K3EDTA (1.8mg/mL) for routine hematology testing in clinics and dispensaries.',
        packSize: 'Case of 1800',
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg'],
        specifications: [
          { key: 'Catalog Number', value: 'HTK3E (Postfix 1-4, 5-6, 7-10)' },
          { key: 'Volumes', value: '1.0-4.0 mL (13x75mm), 5.0-6.0 mL (13x100mm), 7.0-10.0 mL (16x100mm)' },
          { key: 'Material', value: 'PP / PE' },
          { key: 'Additive', value: 'K3 EDTA 1.8mg / mL' },
          { key: 'Closure', value: 'Unique Click Lock Leak-Proof System' }
        ],
        attributes: [
          { name: 'Type', value: 'Open System Blood Collection' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'Hemo Tube Non-Vacuum K3EDTA Tubes Supplier Pune',
        seoDescription: 'Buy Hemo Tube K3EDTA non-vacuum collection tubes in Pune. Click-lock closure system for pathology labs.',
        isFeatured: true,
        displayOrder: 14,
        status: 'published'
      },
      {
        name: 'Hemo Tube K2EDTA Non Vacuum Tube',
        slug: 'hemo-tube-k2edta-non-vacuum-tube',
        sku: 'HTK2E',
        category: categoryMap['non-vacuum-tubes'],
        shortDescription: 'Non-vacuum blood collection tube with Click Lock system and precision spray-coated K2EDTA.',
        description: 'Featuring high-clarity polypropylene construction with tight tolerance moulded parts. The click-lock closure ensures an audible positive lock, eliminating aerosol release and cap pop-offs during handling.',
        packSize: 'Case of 1800',
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg'],
        specifications: [
          { key: 'Catalog Number', value: 'HTK2E' },
          { key: 'Volumes', value: '1.0-4.0 mL, 5.0-6.0 mL, 7.0-10.0 mL' },
          { key: 'Additive', value: 'K2 EDTA 1.8mg / mL' },
          { key: 'Material', value: 'PP / PE' }
        ],
        attributes: [
          { name: 'Application', value: 'Hematology Routine Blood Testing' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'Hemo Tube K2EDTA Non-Vacuum Blood Tubes Pune',
        seoDescription: 'Order Hemo Tube K2EDTA open system tubes in Pune. High-clarity medical grade plastic tubes.',
        isFeatured: false,
        displayOrder: 15,
        status: 'published'
      },
      {
        name: 'Hemo Tube Blood Clot Activator Tube',
        slug: 'hemo-tube-blood-clot-activator-tube',
        sku: 'HTBCA',
        category: categoryMap['non-vacuum-tubes'],
        shortDescription: 'Non-vacuum serum collection tube with clot activator and leak-proof click lock closure.',
        description: 'Ensures rapid and complete coagulation for serum separation in pathology laboratories. Spray coated with silica clot activator particles, providing clean serum recovery within 20 to 30 minutes.',
        packSize: 'Case of 1800',
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg'],
        specifications: [
          { key: 'Catalog Number', value: 'HTBCA' },
          { key: 'Volumes', value: '1.0-4.0 mL (13x75mm), 5.0-6.0 mL (13x100mm), 7.0-10.0 mL (16x100mm)' },
          { key: 'Additive', value: 'Clot Activator' },
          { key: 'Closure', value: 'Click Lock System' }
        ],
        attributes: [
          { name: 'Application', value: 'Biochemistry & Serology Serum Testing' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'Hemo Tube Non-Vacuum Clot Activator Tubes Pune',
        seoDescription: 'Procure Hemo Tube Clot Activator serum tubes in Pune with unique click-lock cap design.',
        isFeatured: false,
        displayOrder: 16,
        status: 'published'
      },
      {
        name: 'Hemo Tube Fluoride Non Vacuum Tube',
        slug: 'hemo-tube-fluoride-non-vacuum-tube',
        sku: 'HTFL',
        category: categoryMap['non-vacuum-tubes'],
        shortDescription: 'Non-vacuum blood sugar testing tube with Sodium Fluoride and EDTA additive.',
        description: 'Specially designed for manual and semi-automated blood glucose testing. Sodium Fluoride inhibits enolase in the glycolytic pathway to preserve glucose concentration.',
        packSize: 'Case of 1800',
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg'],
        specifications: [
          { key: 'Catalog Number', value: 'HTFL' },
          { key: 'Volumes', value: '1.0-4.0 mL, 5.0-6.0 mL, 7.0-10.0 mL' },
          { key: 'Additive', value: 'Sodium Fluoride, EDTA' },
          { key: 'Cap Color', value: 'Grey' }
        ],
        attributes: [
          { name: 'Application', value: 'Blood Glucose Testing' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'Hemo Tube Non-Vacuum Fluoride Sugar Tubes Pune',
        seoDescription: 'Buy Hemo Tube non-vacuum fluoride glucose tubes in Pune. High-accuracy glycolytic inhibitor formulation.',
        isFeatured: false,
        displayOrder: 17,
        status: 'published'
      },
      {
        name: 'Hemo Tube Heparin Non Vacuum Tube',
        slug: 'hemo-tube-heparin-non-vacuum-tube',
        sku: 'HT-HEPARIN',
        category: categoryMap['non-vacuum-tubes'],
        shortDescription: 'Non-vacuum plasma collection tube spray coated with Sodium or Lithium Heparin.',
        description: 'Brand Hemo Tube non-vacuum heparin tubes for urgent plasma biochemistry and blood gas analysis. Features click lock leak-proof cap.',
        packSize: 'Case of 1800',
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg'],
        specifications: [
          { key: 'Catalog Number', value: 'HT (Postfix SH 1-4, LH 1-4)' },
          { key: 'Draw Volume', value: '1.0 - 4.0 mL (13x75 mm)' },
          { key: 'Additive', value: 'Sodium Heparin / Lithium Heparin' },
          { key: 'Cap Color', value: 'Green' }
        ],
        attributes: [
          { name: 'Application', value: 'Clinical Plasma Determinations' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'Hemo Tube Heparin Non-Vacuum Green Tubes Pune',
        seoDescription: 'Find Hemo Tube Heparin open system blood collection tubes in Pune for diagnostic laboratories.',
        isFeatured: false,
        displayOrder: 18,
        status: 'published'
      },
      {
        name: 'Hemo Tube SST Gel Non Vacuum Tube',
        slug: 'hemo-tube-sst-gel-non-vacuum-tube',
        sku: 'HTSST',
        category: categoryMap['non-vacuum-tubes'],
        shortDescription: 'Open system serum separator tube with polymer barrier gel and clot activator.',
        description: 'Provides superior serum isolation in an open system format. The thixotropic gel barrier forms a clean layer over erythrocytes post centrifugation.',
        packSize: 'Case of 1800',
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg'],
        specifications: [
          { key: 'Catalog Number', value: 'HTSST (Postfix 35, 50)' },
          { key: 'Volumes', value: '3.5 mL (13x75mm), 5.0 mL (13x100mm)' },
          { key: 'Additive', value: 'SST Gel + Clot Activator' },
          { key: 'Cap Color', value: 'Yellow' }
        ],
        attributes: [
          { name: 'Application', value: 'Clinical Serum Analysis' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'Hemo Tube SST Gel Non-Vacuum Yellow Top Tubes Pune',
        seoDescription: 'Order Hemo Tube SST Gel non-vacuum tubes in Pune. Premium gel barrier for clean serum separation.',
        isFeatured: false,
        displayOrder: 19,
        status: 'published'
      },
      {
        name: 'Hemo Tube ESR & PTT Non Vacuum Tubes',
        slug: 'hemo-tube-esr-ptt-non-vacuum-tubes',
        sku: 'HTESR',
        category: categoryMap['non-vacuum-tubes'],
        shortDescription: 'Non-vacuum ESR (1.6mL) and PTT (1.8mL, 2.7mL) tubes with 3.2% Sodium Citrate.',
        description: 'Manufactured with high-precision optical clarity for accurate reading. 3.2% Sodium Citrate ratio calibrated for coagulation tests and manual Westergren ESR readings.',
        packSize: 'Case of 1800',
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg'],
        specifications: [
          { key: 'Catalog Numbers', value: 'HTESR Postfix 16 (ESR), Postfix 18 & 27 (PTT)' },
          { key: 'Volumes', value: '1.6 mL (ESR), 1.8 mL & 2.7 mL (PTT)' },
          { key: 'Tube Size', value: '13x75 mm' },
          { key: 'Additive', value: 'Sodium Citrate 3.2%' }
        ],
        attributes: [
          { name: 'Application', value: 'Coagulation Studies & ESR' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'Hemo Tube Non-Vacuum ESR & PTT Tubes Pune',
        seoDescription: 'Buy Hemo Tube ESR and PTT non-vacuum collection tubes in Pune for coagulation diagnostics.',
        isFeatured: false,
        displayOrder: 20,
        status: 'published'
      },

      // -------------------------------------------------------------------------
      // SECTION 3: SAMPLE TRANSPORT
      // -------------------------------------------------------------------------
      {
        name: 'HemoVac Plus Closed System Urine Container',
        slug: 'hemovac-plus-closed-system-urine-container',
        sku: 'MBSCVAC',
        category: categoryMap['sample-transport'],
        shortDescription: 'Spill-proof 50mL/60mL urine container with integrated cannula transfer port for vacuum tubes.',
        description: 'The unique closed system of urine culture testing helps in reducing sample contamination and maintains superior hygiene during handling. Includes a built-in Luer adapter/cannula mechanism. When samples are stored in the accompanying preservative tube, refrigeration is not required for up to 24 hours. Ribbed and tapered edges ensure slip-free tightening.',
        packSize: 'Case of 200 - 500',
        featuredImage: '/images/hemo-porter.jpg',
        images: ['/images/hemo-porter.jpg', '/images/centrifuge.jpg'],
        specifications: [
          { key: 'Catalog Numbers', value: 'MBSCVAC50 (50mL), MBSCVAC60 (60mL), MBSC50ADD, MBSC60ADD' },
          { key: 'Capacities', value: '50 mL and 60 mL graduated' },
          { key: 'Sterility', value: 'EO Sterile' },
          { key: 'Features', value: 'With Luer Adapter / Boric Acid preservative' },
          { key: 'Testing', value: '100% Leak Tested under negative pressure' }
        ],
        attributes: [
          { name: 'Mechanism', value: 'Hermetically Sealed Vacuum Transfer' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'HemoVac Plus Closed System Urine Containers Pune',
        seoDescription: 'Procure HemoVac Plus closed system urine culture containers in Pune. Spill-proof transfer adapter containers.',
        isFeatured: true,
        displayOrder: 21,
        status: 'published'
      },
      {
        name: 'Specimen Containers (Leak Proof Click Lock)',
        slug: 'specimen-containers-click-lock',
        sku: 'MBSC-SERIES',
        category: categoryMap['sample-transport'],
        shortDescription: 'Medical specimen containers (30mL, 50mL, 60mL, 100mL) tested for leak-proof sample transport.',
        description: 'Precision injection-moulded from virgin medical-grade polypropylene. Click Locking mechanism ensures an audible, positive lock after tightening. 100% leak-tested under negative pressure to guarantee safe, spill-free pneumatic tube and road transport.',
        packSize: 'Case of 200 - 3000',
        featuredImage: '/images/hemo-porter.jpg',
        images: ['/images/hemo-porter.jpg'],
        specifications: [
          { key: 'Sizes Available', value: '30 mL, 50 mL, 60 mL, 100 mL' },
          { key: 'Sterility Options', value: 'EO Sterile, Gamma Sterile, Unsterile' },
          { key: 'Labeling', value: 'With Patient ID Label / Cap Seal Label' },
          { key: 'Material', value: 'Polypropylene (PP)' },
          { key: 'Feature', value: 'Click-lock lid, leak tested under negative pressure' }
        ],
        attributes: [
          { name: 'Application', value: 'Sputum, Urine, Stool & Biopsy Transport' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'Click Lock Leak Proof Specimen Containers Pune',
        seoDescription: 'Buy leak-proof Click Lock specimen containers 30ml, 50ml, 60ml, 100ml in Pune. Tested for medical transport.',
        isFeatured: false,
        displayOrder: 22,
        status: 'published'
      },
      {
        name: 'Hemo Porter Cool Case',
        slug: 'hemo-porter-cool-case',
        sku: 'MBHP50',
        category: categoryMap['sample-transport'],
        shortDescription: 'Innovative blood transport box with temperature indicator and integrated cooling gel.',
        description: 'An innovative product that encapsulates cooling media and a temperature indicator inside a secured container to transport blood samples in conditions that extend stability during transit. Recommended by Lupin Diagnostics. Vertically stackable to save valuable laboratory and courier space.',
        packSize: 'Case of 6',
        featuredImage: '/images/hemo-porter.jpg',
        images: ['/images/hemo-porter.jpg', '/images/hero-lab.jpg'],
        specifications: [
          { key: 'Catalog Numbers', value: 'MBHP50, MBHP50T, MBHP50TI, MBHP50TTI' },
          { key: 'Tube Compatibility', value: '13x75 mm & 13x100 mm blood tubes' },
          { key: 'Temperature Indicator', value: 'Built-in real-time thermal gauge' },
          { key: 'Material', value: 'High-Impact PP / ABS' },
          { key: 'Cooling System', value: 'Integrated Phase-Change Cooling Gel' }
        ],
        attributes: [
          { name: 'Endorsement', value: 'Lupin Diagnostics Recommended' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'Hemo Porter Blood Sample Cool Case Supplier Pune',
        seoDescription: 'Order Hemo Porter cool cases with temperature indicator in Pune. Reliable cold-chain specimen transport.',
        isFeatured: true,
        displayOrder: 23,
        status: 'published'
      },
      {
        name: 'Phlebotomy Insulated Sample Transport Bag',
        slug: 'phlebotomy-insulated-sample-transport-bag',
        sku: 'MBPB10',
        category: categoryMap['sample-transport'],
        shortDescription: 'Insulated 10-liter phlebotomist home collection bag with digital temperature indicator.',
        description: 'Heavy-duty insulated phlebotomy bag with built-in digital temperature display and 10 Liter capacity. Rugged fly and zipper ensure years of durability. Incorporates external net pockets for gloves and used supplies without opening the main cool compartment. Forms a perfect combination with the Hemo Porter.',
        packSize: 'Case of 12',
        featuredImage: '/images/hemo-porter.jpg',
        images: ['/images/hemo-porter.jpg'],
        specifications: [
          { key: 'Catalog Number', value: 'MBPB10' },
          { key: 'Capacity', value: '10 Liters' },
          { key: 'Insulation', value: 'Open Cell PU Thermal Foam' },
          { key: 'Temperature Sensor', value: 'External Digital Temperature Display' },
          { key: 'Pockets', value: 'Spacious top & side mesh utility pockets' }
        ],
        attributes: [
          { name: 'Use Case', value: 'Home Sample Collection & Phlebotomy Routes' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'Phlebotomy Bag with Digital Temperature Display Pune',
        seoDescription: 'Procure 10L insulated phlebotomy collection bags with digital temperature indicator in Pune.',
        isFeatured: false,
        displayOrder: 24,
        status: 'published'
      },

      // -------------------------------------------------------------------------
      // SECTION 4: GENERAL LAB-WARES
      // -------------------------------------------------------------------------
      {
        name: 'Centrifuge Tubes (15mL, 50mL & 10mL)',
        slug: 'centrifuge-tubes-15ml-50ml-10ml',
        sku: 'MBCT-SERIES',
        category: categoryMap['lab-wares'],
        shortDescription: 'Graduated centrifuge tubes rated to 15,000 RCF (G) tested for negative pressure leak resistance.',
        description: 'Manufactured from medical grade polypropylene to withstand extreme centrifugal forces up to 15,000g RCF. Undergoes negative pressure testing to eliminate leaks during pneumatic chute and air transport. Clearly printed graduation lines, large frosted writing patch, and ribbed slip-free caps.',
        packSize: 'Case of 500 - 2000',
        featuredImage: '/images/centrifuge.jpg',
        images: ['/images/centrifuge.jpg', '/images/rd-lab.jpg'],
        specifications: [
          { key: 'Catalog Numbers', value: 'MBCT15 (15mL), MBCT50 (50mL), MBCT10 (10mL self-standing)' },
          { key: 'Volumes', value: '15.0 mL Conical, 50.0 mL Conical, 10.0 mL Self Standing' },
          { key: 'RCF Rating', value: '15,000 x g' },
          { key: 'Sterility Variants', value: 'Unsterile, EO Sterile, Gamma Sterile' },
          { key: 'Material', value: 'Polypropylene (PP)' }
        ],
        attributes: [
          { name: 'Certification', value: 'DNase / RNase Free' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'Centrifuge Tubes 15ml and 50ml Supplier Pune',
        seoDescription: 'Buy 15ml and 50ml conical centrifuge tubes in Pune. 15,000g RCF rated, sterile and unsterile options.',
        isFeatured: true,
        displayOrder: 25,
        status: 'published'
      },
      {
        name: 'Plastic Test Tubes (RIA Tubes) & Lids',
        slug: 'plastic-test-tubes-ria-tubes-and-lids',
        sku: 'MBTT-SERIES',
        category: categoryMap['lab-wares'],
        shortDescription: 'Automated injection-moulded RIA plastic test tubes (12x75mm & 12x100mm) and caps.',
        description: 'Manufactured on state-of-the-art automated robotic lines untouched by human hands. Delivers exceptional optical clarity, structural rigidity, and chemical resistance. Features a top mouth rim rib for secure cap fitting.',
        packSize: 'Case of 2000 - 10000',
        featuredImage: '/images/centrifuge.jpg',
        images: ['/images/centrifuge.jpg'],
        specifications: [
          { key: 'Catalog Numbers', value: 'MBTT1275PS, MBTT1275PP, MBTT12100PS, MBTT12100PP, MBTTLID' },
          { key: 'Sizes', value: '12x75 mm & 12x100 mm' },
          { key: 'Materials', value: 'Polystyrene (PS) & Polypropylene (PP)' },
          { key: 'Lids', value: 'MBTTLID Cap for 75mm tubes (Case of 10,000)' }
        ],
        attributes: [
          { name: 'Application', value: 'RIA, Coagulation, Routine Lab Testing' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'Plastic RIA Test Tubes 12x75 and 12x100 Pune',
        seoDescription: 'Order high-clarity plastic test tubes RIA and lids in Pune. Bulk cases for pathology laboratories.',
        isFeatured: false,
        displayOrder: 26,
        status: 'published'
      },
      {
        name: 'Swab Stick in Polypropylene Tube',
        slug: 'swab-stick-in-polypropylene-tube',
        sku: 'MBSS13100EO',
        category: categoryMap['lab-wares'],
        shortDescription: 'DNAse / RNAse free wooden swab stick with medical wool concealed in sterile PP tube.',
        description: 'Swab sticks from MB are carefully crafted with the finest quality absorbent wool for maximum sample retention and release. Enclosed inside a sterile polypropylene tube with a secure plug cap for contamination-free sample transport.',
        packSize: 'Case of 5000',
        featuredImage: '/images/centrifuge.jpg',
        images: ['/images/centrifuge.jpg'],
        specifications: [
          { key: 'Catalog Number', value: 'MBSS13100EO' },
          { key: 'Sterility', value: 'EO Sterile' },
          { key: 'Material', value: 'Wooden stick with cotton swab, PP tube' },
          { key: 'Purity', value: 'DNAse / RNAse Free' }
        ],
        attributes: [
          { name: 'Application', value: 'Microbiology Smears & Specimen Picking' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'Sterile Swab Sticks in Tube Supplier Pune',
        seoDescription: 'Procure DNAse and RNAse free sterile swab sticks in tubes in Pune for microbiological collection.',
        isFeatured: false,
        displayOrder: 27,
        status: 'published'
      },
      {
        name: 'Convertible Multipurpose Vial (False Bottom Tube)',
        slug: 'convertible-multipurpose-false-bottom-vial',
        sku: 'MBMP1275',
        category: categoryMap['lab-wares'],
        shortDescription: 'Innovative 2.5mL false bottom tube that converts into a self-standing storage vial.',
        description: 'An innovative addition to modern laboratory plasticware. Assembled in two detachable parts; separating them reduces the overall height to create a self-standing 2.5mL vial that is easy to store, freeze, and process on automated analyzer carousels.',
        packSize: 'Case of 5000 - 10000',
        featuredImage: '/images/centrifuge.jpg',
        images: ['/images/centrifuge.jpg'],
        specifications: [
          { key: 'Catalog Numbers', value: 'MBMP1275 (False Bottom Tube), MBSV1250 (Storage Vial)' },
          { key: 'Capacity', value: '2.5 mL' },
          { key: 'Material', value: 'Polypropylene (PP)' },
          { key: 'Design', value: 'Two-part convertible, self-standing' }
        ],
        attributes: [
          { name: 'Application', value: 'Analyzer Sampling, Aliquot Storage' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'False Bottom Multipurpose Vials Supplier Pune',
        seoDescription: 'Buy 2.5ml false bottom convertible tubes and storage vials in Pune. Compatible with automated analyzers.',
        isFeatured: false,
        displayOrder: 28,
        status: 'published'
      },
      {
        name: 'Petri Dishes (Ultra Flat)',
        slug: 'petri-dishes-ultra-flat',
        sku: 'MBPD-SERIES',
        category: categoryMap['lab-wares'],
        shortDescription: 'Ultra-flat polystyrene petri plates (90x15mm & 100x25mm) for uniform media spreading.',
        description: 'Petri dishes manufactured by MB feature ultra-flat optical surfaces. The exceptional flatness facilitates uniform depth when pouring agar media, offering higher microbial growth consistency. Packaged in single sterile pouches or sleeves of 10.',
        packSize: 'Case of 500 - 2000',
        featuredImage: '/images/centrifuge.jpg',
        images: ['/images/centrifuge.jpg'],
        specifications: [
          { key: 'Catalog Numbers', value: 'MBPD9015, MBPD9015EO, MBPD9015G, MBCT1025, MBPD9015V' },
          { key: 'Sizes', value: '90x15 mm and 100x25 mm (Vented / Non-vented)' },
          { key: 'Sterility', value: 'Unsterile, EO Sterile, Gamma Sterile' },
          { key: 'Material', value: 'Crystal Grade Polystyrene (PS)' }
        ],
        attributes: [
          { name: 'Purity', value: 'DNAse / RNAse Free' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'Petri Dishes 90mm and 100mm Supplier Pune',
        seoDescription: 'Find ultra-flat sterile 90mm and 100mm petri dishes in Pune. Uniform agar media spreading plates.',
        isFeatured: false,
        displayOrder: 29,
        status: 'published'
      },
      {
        name: 'ESR Pipettes (Smudge Resistant Graduated)',
        slug: 'esr-pipettes-smudge-resistant',
        sku: 'MBESR',
        category: categoryMap['lab-wares'],
        shortDescription: 'Accurate 180mm Westergren ESR pipettes with rubber insert and venting system.',
        description: 'Calibrated Westergren ESR pipettes with clear, smudge-resistant graduations over 60 minutes. Incorporates a high-quality rubber sealing insert and venting system to deliver precise, repeatable sedimentation readings.',
        packSize: 'Case of 2000',
        featuredImage: '/images/centrifuge.jpg',
        images: ['/images/centrifuge.jpg'],
        specifications: [
          { key: 'Catalog Number', value: 'MBESR' },
          { key: 'Length & Scale', value: '180 mm with readings over 60 minutes' },
          { key: 'Material', value: 'Polystyrene (PS)' },
          { key: 'Feature', value: 'Smudge-resistant markings, self-zeroing plug' }
        ],
        attributes: [
          { name: 'Application', value: 'Erythrocyte Sedimentation Rate' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'Westergren ESR Pipettes Supplier in Pune',
        seoDescription: 'Order 180mm graduated Westergren ESR pipettes in Pune for pathology sedimentation tests.',
        isFeatured: false,
        displayOrder: 30,
        status: 'published'
      },
      {
        name: 'Gilson Graduated Micropipette Tips',
        slug: 'gilson-graduated-micropipette-tips',
        sku: 'MBMPT-SERIES',
        category: categoryMap['lab-wares'],
        shortDescription: 'Ultra-clear graduated micropipette tips (200uL & 1000uL) in clear and color coded variants.',
        description: 'Manufactured with high-precision moulds ensuring flash-free orifice openings and ultra-low liquid retention. Features graduation rings for quick volume checks. Universal fit for Gilson, Eppendorf, and major pipette brands.',
        packSize: 'Case of 15000 - 50000',
        featuredImage: '/images/centrifuge.jpg',
        images: ['/images/centrifuge.jpg'],
        specifications: [
          { key: 'Catalog Numbers', value: 'MBMPT200C (200uL Clear), MBMPT200Y (Yellow), MBMPT1000C (1000uL Clear), MBMPT1000B (Blue)' },
          { key: 'Volumes', value: '200 uL and 1000 uL' },
          { key: 'Material', value: 'Virgin Polypropylene (PP)' },
          { key: 'Type', value: 'Gilson Graduated Universal Fit' }
        ],
        attributes: [
          { name: 'Features', value: 'Hydrophobic Low Retention' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'Universal Micropipette Tips 200ul and 1000ul Pune',
        seoDescription: 'Buy graduated 200uL and 1000uL micropipette tips in Pune. Precision orifice, universal fit tips.',
        isFeatured: false,
        displayOrder: 31,
        status: 'published'
      },
      {
        name: 'Sample Cups & Microcentrifuge Tubes (MCT)',
        slug: 'sample-cups-and-microcentrifuge-tubes',
        sku: 'MBSC-MBMCT',
        category: categoryMap['lab-wares'],
        shortDescription: 'Hitachi analyzer sample cups (2.0mL) and snap-cap microcentrifuge tubes (0.5mL, 1.5mL, 2.0mL).',
        description: 'Highly transparent 2.0mL polystyrene sample cups engineered for automated clinical chemistry analyzers. Microcentrifuge tubes (MCT) are manufactured from virgin polypropylene without slip agents or plasticizers, ensuring leak-free centrifugation and storage.',
        packSize: 'Case of 7000 - 20000',
        featuredImage: '/images/centrifuge.jpg',
        images: ['/images/centrifuge.jpg'],
        specifications: [
          { key: 'Sample Cups (MBSC20)', value: '2.0 mL Polystyrene (PS) | Case of 7000' },
          { key: 'MCT 0.5 mL (MBMCT05)', value: 'Conical Base, Snap Cap (PP) | Case of 20000' },
          { key: 'MCT 1.5 mL (MBMCT15)', value: 'Conical Base, Snap Cap (PP) | Case of 12000' },
          { key: 'MCT 2.0 mL (MBMCT20)', value: 'Round Base, Snap Cap (PP) | Case of 12000' }
        ],
        attributes: [
          { name: 'Compatibility', value: 'Hitachi, Roche, Olympus & Beckman Analyzers' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'Hitachi Sample Cups and MCT Tubes Supplier Pune',
        seoDescription: 'Procure 2.0ml sample cups and 0.5ml, 1.5ml, 2.0ml MCT tubes in Pune for automated analyzers.',
        isFeatured: false,
        displayOrder: 32,
        status: 'published'
      },

      // -------------------------------------------------------------------------
      // SECTION 5: HISTOPATHOLOGY & PHLEBOTOMY ACCESSORIES
      // -------------------------------------------------------------------------
      {
        name: 'Histopathology Tissue Embedding Cassettes',
        slug: 'histopathology-tissue-embedding-cassettes',
        sku: 'MBEC-SERIES',
        category: categoryMap['histopathology'],
        shortDescription: 'Acetal polymer tissue embedding cassettes with 35° & 45° writing edge, joined/removable lids.',
        description: 'Made of high-density acetal polymer resistant to all histology solvents including xylene, alcohols, and formalin. Features perfectly etched writing surfaces and automated cassette labeler compatibility. Positive snap-latch prevents specimen loss during dehydration and paraffin embedding.',
        packSize: 'Case of 5000',
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg'],
        specifications: [
          { key: 'Catalog Numbers', value: 'MBEC35R, MBEC35J, MBEC45R, MBEC45J, MBEC45M (Mesh)' },
          { key: 'Dimensions', value: '1.6 x 1.1 x 0.26 Inch' },
          { key: 'Lid Styles', value: '35° & 45° Edge, Removable Lid, Joined Lid, Biopsy Mesh' },
          { key: 'Material', value: 'Solvent-Resistant Acetal Polymer' }
        ],
        attributes: [
          { name: 'Application', value: 'Tissue Embedding & Biopsy Processing' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'Histopathology Embedding Cassettes Supplier Pune',
        seoDescription: 'Buy acetal tissue embedding cassettes 35 and 45 degree in Pune. Solvent-resistant biopsy cassettes.',
        isFeatured: true,
        displayOrder: 33,
        status: 'published'
      },
      {
        name: 'Histopathology Tissue Embedding Rings',
        slug: 'histopathology-tissue-embedding-rings',
        sku: 'MBER',
        category: categoryMap['histopathology'],
        shortDescription: 'Precision moulded high-impact polystyrene embedding rings for microtome chuck clamping.',
        description: 'Moulded from premium-grade, chemically inert high-impact polystyrene (HIPS). Engineered for dimensional rigidity and secure locking onto microtome specimen clamps during tissue sectioning. Etched textured surface for clear specimen identification.',
        packSize: 'Case of 5000',
        featuredImage: '/images/centrifuge.jpg',
        images: ['/images/centrifuge.jpg'],
        specifications: [
          { key: 'Catalog Number', value: 'MBER' },
          { key: 'Dimensions', value: '1.6 x 1.0 x 0.5 Inch' },
          { key: 'Material', value: 'High-Impact Polystyrene (HIPS)' },
          { key: 'Colors', value: 'Available in custom colors' }
        ],
        attributes: [
          { name: 'Application', value: 'Microtomy & Tissue Block Clamping' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'Tissue Embedding Rings Supplier in Pune',
        seoDescription: 'Order high-impact polystyrene tissue embedding rings in Pune for histology laboratory sectioning.',
        isFeatured: false,
        displayOrder: 34,
        status: 'published'
      },
      {
        name: 'Polymer Coated Nitrile Examination Gloves',
        slug: 'polymer-coated-nitrile-examination-gloves',
        sku: 'MBNG-SERIES',
        category: categoryMap['histopathology'],
        shortDescription: 'Chlorine-free medical grade polymer coated nitrile gloves (Small, Medium, Large).',
        description: 'Subjected to rigorous quality control checks and individually examined before environmentally controlled dry packaging. Polymer coated on the interior to eliminate chlorination, providing tactile sensitivity, puncture resistance, and skin hypoallergenic protection.',
        packSize: 'Case of 2000',
        featuredImage: '/images/hero-lab.jpg',
        images: ['/images/hero-lab.jpg'],
        specifications: [
          { key: 'Catalog Numbers', value: 'MBNGS (Small), MBNGM (Medium), MBNGL (Large)' },
          { key: 'Material', value: 'Polymer Coated Nitrile (Chlorine Free)' },
          { key: 'Color', value: 'Medical Blue' },
          { key: 'Texture', value: 'Textured Fingertips for Enhanced Grip' }
        ],
        attributes: [
          { name: 'Standards', value: 'Medical Examination Grade' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'Polymer Coated Nitrile Gloves Supplier Pune',
        seoDescription: 'Buy chlorine-free polymer coated nitrile examination gloves in Pune. Puncture-resistant medical gloves.',
        isFeatured: false,
        displayOrder: 35,
        status: 'published'
      },
      {
        name: 'Phlebotomy Alcohol Prep Swabs & Spot Bandages',
        slug: 'phlebotomy-alcohol-prep-swabs-spot-bandages',
        sku: 'MBAPS-MBSB',
        category: categoryMap['histopathology'],
        shortDescription: '70% Isopropyl Alcohol prep swabs and round spot bandages for venipuncture care.',
        description: 'Pre-injection antiseptic skin preparation and post-venipuncture wound dressing essentials. Individually foil-sealed 2-ply alcohol prep swabs saturated with 70% IPA, and round skin-tone adhesive spot bandages.',
        packSize: 'Pack of 100',
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg'],
        specifications: [
          { key: 'Alcohol Prep Swab (MBAPS)', value: 'Individually Packed, 70% Isopropyl Alcohol | Pack of 100' },
          { key: 'Spot Bandage (MBSB)', value: 'Round Adhesive Spot Bandage | Pack of 100' }
        ],
        attributes: [
          { name: 'Application', value: 'Venipuncture Skin Antisepsis & Dressing' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'Alcohol Prep Swabs and Spot Bandages Pune',
        seoDescription: 'Procure 70% IPA alcohol swabs and round venipuncture spot bandages in Pune for phlebotomists.',
        isFeatured: false,
        displayOrder: 36,
        status: 'published'
      },
      {
        name: 'Disposable Hypodermic Syringes with Needles',
        slug: 'disposable-hypodermic-syringes-with-needles',
        sku: 'MBSYR-SERIES',
        category: categoryMap['histopathology'],
        shortDescription: 'Sterile 2mL, 3mL, 5mL, 10mL disposable syringes with needle for smooth clinical draw.',
        description: 'Precisely controlled piston finish and plunger movement ensures reliable medication delivery and blood draw. Precision cannula gauge and optimized bevel angle minimizes tissue trauma and guarantees patient comfort.',
        packSize: 'Pack of 1500 - 2700',
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg'],
        specifications: [
          { key: 'Catalog Numbers', value: 'MBSYR2 (2mL, Pack 2700), MBSYR3 (3mL, Pack 2700), MBSYR5 (5mL, Pack 2400), MBSYR10 (10mL, Pack 1500)' },
          { key: 'Sizes', value: '2 mL, 3 mL, 5 mL, 10 mL' },
          { key: 'Material', value: 'Polypropylene (PP)' },
          { key: 'Needle', value: 'Precision gauge with silicone coating' }
        ],
        attributes: [
          { name: 'Sterility', value: 'EO Sterile Individually Blister Packed' },
          { name: 'City Availability', value: 'Pune, Maharashtra' }
        ],
        seoTitle: 'Sterile Disposable Syringes 2ml 5ml 10ml Supplier Pune',
        seoDescription: 'Buy disposable medical syringes 2ml, 3ml, 5ml, 10ml with needles in Pune. High-precision clinical syringes.',
        isFeatured: false,
        displayOrder: 37,
        status: 'published'
      }
    ];

    console.log(`[Catalog Upload] Uploading ${catalogProducts.length} products to database...`);

    let createdCount = 0;
    let updatedCount = 0;

    for (const prod of catalogProducts) {
      const existing = await Product.findOne({
        $or: [{ slug: prod.slug }, { sku: prod.sku }]
      });

      if (!existing) {
        await Product.create(prod);
        createdCount++;
        console.log(`[+] Created product: ${prod.name} (${prod.sku})`);
      } else {
        await Product.updateOne(
          { _id: existing._id },
          {
            $set: {
              name: prod.name,
              category: prod.category,
              sku: prod.sku,
              shortDescription: prod.shortDescription,
              description: prod.description,
              packSize: prod.packSize,
              featuredImage: prod.featuredImage,
              images: prod.images,
              specifications: prod.specifications,
              attributes: prod.attributes,
              seoTitle: prod.seoTitle,
              seoDescription: prod.seoDescription,
              status: prod.status,
              isFeatured: prod.isFeatured,
              displayOrder: prod.displayOrder
            }
          }
        );
        updatedCount++;
        console.log(`[*] Updated product: ${prod.name} (${prod.sku})`);
      }
    }

    const totalInDb = await Product.countDocuments();
    console.log(`\n==================================================`);
    console.log(`[SUCCESS] Catalog products upload complete!`);
    console.log(`Newly Created: ${createdCount}`);
    console.log(`Updated:       ${updatedCount}`);
    console.log(`Total in DB:   ${totalInDb}`);
    console.log(`==================================================\n`);

  } catch (error) {
    console.error('[Catalog Upload ERROR]:', error);
    throw error;
  } finally {
    await closeDB();
  }
}

// Run directly if called from command line
if (process.argv[1].endsWith('uploadCatalogProducts.js')) {
  uploadCatalogProducts()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
