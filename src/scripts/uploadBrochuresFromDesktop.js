import fs from 'fs';
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  { id: '6ad61e502020749e31693c57' },
  'supplimed_production_secure_secret_key_change_me_2026',
  { expiresIn: '7d' }
);

const PDF_DIR = 'C:\\Users\\mdusm\\OneDrive\\Desktop\\website\\supplimed\\pdf';
const API_URL = 'https://supplimed-backend.onrender.com/api/brochures/admin';

const BROCHURES = [
  {
    fileName: 'Hemostar-XF-2.0-Brochure.pdf',
    title: 'Hemostar XF 2.0 Coagulation Analyzer',
    subtitle: 'Semi-Automated Hemostasis & Clotting Testing System',
    category: 'Master Catalogue',
    fileSize: '0.7 MB',
    pages: 2,
    description: 'Advanced semi-automated coagulation analyzer for high-precision clotting assays, PT, APTT, Fibrinogen, and Thrombin Time in clinical diagnostic laboratories.',
    highlights: [
      'Accurate magnetic stirrer & optical clot detection',
      'Pre-programmed testing protocols for PT, APTT, FIB, TT',
      'Open reagent system with temperature-controlled incubation',
      'Built-in thermal printer and LCD display interface'
    ],
    coverImage: '/images/centrifuge.jpg',
    displayOrder: 3
  },
  {
    fileName: 'getinge_assured_range_brochure-en-non_us_canada.pdf',
    title: 'Getinge Assured Sterility Assurance & Wash Monitoring',
    subtitle: 'Comprehensive Range of Chemical & Biological Indicators',
    category: 'Quality & Regulatory',
    fileSize: '2.9 MB',
    pages: 12,
    description: 'Getinge Assured provides comprehensive sterility assurance and wash monitoring consumables, biological indicators, chemical indicators, and Bowie-Dick tests for CSSD infection control.',
    highlights: [
      'ISO 11140 & ISO 11138 compliant monitoring products',
      'Comprehensive biological indicators for steam and EO sterilization',
      'Bowie-Dick daily air removal test packs',
      'Wash monitoring indicators for automated washer-disinfectors'
    ],
    coverImage: '/images/cleanroom.jpg',
    displayOrder: 4
  },
  {
    fileName: 'Matrix-Readmax-Brochure.pdf',
    title: 'Matrix Gel Card System & Readmax Reader',
    subtitle: 'Automated Immunohematology & Blood Grouping Technology',
    category: 'Blood Collection',
    fileSize: '3.9 MB',
    pages: 2,
    description: 'Tulip Diagnostics Matrix Gel Card system and Readmax optical gel card reader for standardized blood bank typing, crossmatching, antibody screening, and Coombs testing.',
    highlights: [
      'Standardized column agglutination technology',
      'High-sensitivity ABO/Rh typing and antibody screening',
      'Clear, stable reaction endpoints with digital archiving',
      'Automated gel card centrifuge and reader compatibility'
    ],
    coverImage: '/images/tubes.jpg',
    displayOrder: 5
  },
  {
    fileName: 'Bapuji Brochure.pdf',
    title: 'Lyon Medical Packaging & Sterilization Reels',
    subtitle: 'OEM Services & Assured Sterilization Barrier Packaging',
    category: 'Quality & Regulatory',
    fileSize: '4.6 MB',
    pages: 4,
    description: 'Bapuji Surgicals Lyon brand medical packaging solutions including flat and gusseted sterilization reels, self-seal pouches, and OEM contract packaging conforming to EN ISO 11607.',
    highlights: [
      'EN ISO 9001:2008 & EN ISO 13485:2012 certified manufacturing',
      'Class MD-5 licensed medical device packaging',
      'Steam and EO gas indicator strips printed on medical paper',
      'High-barrier multi-layer laminated film for peelable aseptic presentation'
    ],
    coverImage: '/images/cleanroom.jpg',
    displayOrder: 6
  },
  {
    fileName: 'Vein Spy Literature curves.pdf',
    title: 'VeinSpy™ Portable Vascular Imaging Transilluminator',
    subtitle: 'Handheld Non-Invasive Vein Finder for Easy Venipuncture',
    category: 'Blood Collection',
    fileSize: '4.6 MB',
    pages: 2,
    description: 'VeinSpy™ is a portable, handheld vein finder transilluminator designed for pediatric, geriatric, and difficult venipuncture vascular mapping.',
    highlights: [
      'Transverse light technology illuminates veins up to 7mm deep',
      'Reduces first-stick failure and improves patient comfort',
      'Compact, rechargeable battery-powered ergonomic design',
      'Ideal for oncology, ICU, phlebotomy, and emergency departments'
    ],
    coverImage: '/images/hemo-porter.jpg',
    displayOrder: 7
  },
  {
    fileName: 'Erycard-2-Brochure.pdf',
    title: 'Erycard 2.0 Blood Grouping System',
    subtitle: 'Dry-Format Rapid ABO & Rh(D) Blood Grouping Card',
    category: 'Blood Collection',
    fileSize: '4.9 MB',
    pages: 2,
    description: 'Erycard 2.0 is a dry reagent blood grouping card for rapid, bedside ABO and Rh(D) forward and reverse blood grouping with immediate visual agglutination confirmation.',
    highlights: [
      'Dry reagent technology eliminates refrigeration dependency',
      'Rapid result confirmation in under 2 minutes',
      'Simultaneous forward and reverse grouping on single card',
      'ISO 13485 certified diagnostic quality'
    ],
    coverImage: '/images/tubes.jpg',
    displayOrder: 8
  },
  {
    fileName: 'Combiview-Duocheck-brochure.pdf',
    title: 'Combiview & Duocheck Pf Malaria RDT',
    subtitle: 'Rapid Antigen Detection for P. falciparum (Pf HRP2 & Pf pLDH)',
    category: 'Master Catalogue',
    fileSize: '5.2 MB',
    pages: 4,
    description: 'Duocheck Pf and Combiview rapid diagnostic tests provide highly specific dual-antigen (HRP2 & pLDH) detection for Plasmodium falciparum malaria screening.',
    highlights: [
      'Dual-target detection (HRP2 and pLDH) minimizes false negatives',
      'Rapid 15-minute chromatographic immunoassay result',
      'High sensitivity even at low parasitemia levels',
      'Complete kit including sterile lancet, buffer, and sample transfer loop'
    ],
    coverImage: '/images/rd-lab.jpg',
    displayOrder: 9
  },
  {
    fileName: 'Accubas Brochure Final.pdf',
    title: 'AccuBas Clinical Diagnostics & Biochemistry',
    subtitle: 'High-Performance Reagents & Photometric Diagnostic Systems',
    category: 'Master Catalogue',
    fileSize: '5.4 MB',
    pages: 2,
    description: 'AccuBas comprehensive clinical chemistry diagnostic portfolio featuring stabilized liquid-stable reagents, calibrators, and controls for routine pathology labs.',
    highlights: [
      'Liquid-stable ready-to-use clinical biochemistry reagents',
      'Wide measuring range with excellent linearity and recovery',
      'Applicable on semi-automated and fully automated chemistry analyzers',
      'Standardized against international IFCC reference materials'
    ],
    coverImage: '/images/hero-lab.jpg',
    displayOrder: 10
  },
  {
    fileName: 'catalog-price-gun.pdf.pdf',
    title: 'CSSD Batch Documentation & Traceability System',
    subtitle: 'Sterilization Label Applicator & Dual-Indicator System',
    category: 'Quality & Regulatory',
    fileSize: '7.3 MB',
    pages: 21,
    description: 'Hans Hilscher / Margreiter Technik CSSD batch control label gun system with dual-indicator chemical labels for Steam, FO, EO, and VH2O2 sterilization processes.',
    highlights: [
      '3-line alphanumeric traceability label applicator gun',
      'Color-changing Class 1 process chemical indicator on each label',
      'Medical-grade adhesive adheres securely through high-temp autoclaving',
      'Complete documentation of autoclave cycle, operator, and expiry date'
    ],
    coverImage: '/images/cleanroom.jpg',
    displayOrder: 11
  },
  {
    fileName: 'HIV Poster.pdf',
    title: 'HIV 1 & 2 Diagnostic Algorithm & Reference Guide',
    subtitle: 'Clinical Immunoassay Screening & Testing Protocol Poster',
    category: 'Quality & Regulatory',
    fileSize: '10.0 MB',
    pages: 1,
    description: 'Official clinical reference wall poster detailing NACO / WHO compliant HIV 1 & 2 diagnostic testing algorithms, sample handling protocols, and assay interpretation.',
    highlights: [
      'Comprehensive NACO / WHO testing strategy guidelines',
      'Step-by-step 3-test serial algorithm protocol for clinical diagnosis',
      'Troubleshooting guide for indeterminate and discordant results',
      'High-visibility reference chart for laboratories and testing centers'
    ],
    coverImage: '/images/rd-lab.jpg',
    displayOrder: 12
  },
  {
    fileName: 'Bioshield Product Catalog (1).pdf',
    title: 'Bioshield Complete Infection Control & Endoscopy Catalog',
    subtitle: 'Sterile Barriers, Cleaning Verification & Protective Solutions',
    category: 'Master Catalogue',
    fileSize: '22.5 MB',
    pages: 58,
    description: 'Full 58-page comprehensive master catalogue for Bioshield infection prevention, endoscopy cleaning brushes, biopsy valves, transport pads, and endoscopy procedural accessories.',
    highlights: [
      'Complete portfolio of single-use and reusable endoscopy accessories',
      'Enzymatic detergents and lumen cleaning verification kits',
      'Aseptic barrier covers, water bottle systems, and transport accessories',
      'Conforms to international infection control guidelines (AAMI, SGNA)'
    ],
    coverImage: '/images/hero-lab.jpg',
    displayOrder: 13
  }
];

async function uploadAll() {
  console.log(`Starting upload of ${BROCHURES.length} brochures to live backend...`);
  
  for (let i = 0; i < BROCHURES.length; i++) {
    const item = BROCHURES[i];
    const fullPath = `${PDF_DIR}\\${item.fileName}`;
    
    console.log(`\n[${i + 1}/${BROCHURES.length}] Uploading: "${item.title}" (${item.fileName}, ${item.fileSize})...`);
    
    if (!fs.existsSync(fullPath)) {
      console.error(`  File NOT FOUND: ${fullPath}`);
      continue;
    }

    const fileBuf = fs.readFileSync(fullPath);
    const fileBlob = new Blob([fileBuf], { type: 'application/pdf' });
    
    const form = new FormData();
    form.append('title', item.title);
    form.append('subtitle', item.subtitle);
    form.append('category', item.category);
    form.append('fileSize', item.fileSize);
    form.append('pages', String(item.pages));
    form.append('description', item.description);
    form.append('status', 'published');
    form.append('featured', 'false');
    form.append('displayOrder', String(item.displayOrder));
    form.append('coverImage', item.coverImage);
    form.append('highlights', JSON.stringify(item.highlights));
    form.append('tableOfContents', JSON.stringify([]));
    form.append('pdfFile', fileBlob, item.fileName);

    try {
      const startTime = Date.now();
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: form
      });

      const data = await res.json();
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      if (res.ok && data.success) {
        console.log(`  -> SUCCESS (${elapsed}s)! Uploaded to ${data.brochure.fileUrl} (ID: ${data.brochure._id})`);
      } else {
        console.error(`  -> FAILED (${res.status}):`, data.message || data);
      }
    } catch (err) {
      console.error(`  -> ERROR:`, err.message);
    }
  }

  console.log('\nAll brochures processed.');
}

uploadAll();
