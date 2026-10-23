import { connectDB, closeDB } from '../config/db.js';
import { Product } from '../models/Product.js';

const productImages = {
  // SECTION 1: VACUUM BLOOD COLLECTION TUBES
  'VACK3E': {
    featuredImage: '/images/catalog/hemovac-k3edta.jpg',
    images: ['/images/catalog/hemovac-k3edta.jpg', '/images/catalog/img_075_1294x711.jpg']
  },
  'VACK2E': {
    featuredImage: '/images/catalog/hemovac-k2edta.jpg',
    images: ['/images/catalog/hemovac-k2edta.jpg', '/images/catalog/img_075_1294x711.jpg']
  },
  'VACBCA': {
    featuredImage: '/images/catalog/hemovac-clot-activator.jpg',
    images: ['/images/catalog/hemovac-clot-activator.jpg', '/images/catalog/img_051_550x389.jpg']
  },
  'VACFL': {
    featuredImage: '/images/catalog/hemovac-fluoride.jpg',
    images: ['/images/catalog/hemovac-fluoride.jpg', '/images/catalog/img_018_363x213.jpg']
  },
  'VACPTT': {
    featuredImage: '/images/catalog/hemovac-citrate-ptt.jpg',
    images: ['/images/catalog/hemovac-citrate-ptt.jpg', '/images/catalog/img_027_704x844.jpg']
  },
  'VACESR': {
    featuredImage: '/images/catalog/hemovac-citrate-esr.jpg',
    images: ['/images/catalog/hemovac-citrate-esr.jpg']
  },
  'VACSST': {
    featuredImage: '/images/catalog/hemovac-sst-gel.jpg',
    images: ['/images/catalog/hemovac-sst-gel.jpg']
  },
  'VAC-LH-SH': {
    featuredImage: '/images/catalog/hemovac-heparin.jpg',
    images: ['/images/catalog/hemovac-heparin.jpg']
  },
  'VACUA': {
    featuredImage: '/images/catalog/hemovac-urine-tube.jpg',
    images: ['/images/catalog/hemovac-urine-tube.jpg', '/images/catalog/closed-system-urine-container.jpg']
  },
  'MINI-SERIES': {
    featuredImage: '/images/catalog/hemo-mini-paediatric.jpg',
    images: ['/images/catalog/hemo-mini-paediatric.jpg']
  },
  'VACSPL': {
    featuredImage: '/images/catalog/hemovac-speciality-tubes.jpg',
    images: ['/images/catalog/hemovac-speciality-tubes.jpg']
  },
  'MSN-FBN': {
    featuredImage: '/images/catalog/needles-multisample-flashback.jpg',
    images: ['/images/catalog/needles-multisample-flashback.jpg', '/images/catalog/phlebotomy-alcohol-prep-swabs.jpg']
  },
  'MBSENH': {
    featuredImage: '/images/catalog/needle-holder-auto-release.jpg',
    images: ['/images/catalog/needle-holder-auto-release.jpg', '/images/catalog/needles-multisample-flashback.jpg']
  },

  // SECTION 2: NON VACUUM BLOOD COLLECTION TUBES
  'HTK3E': {
    featuredImage: '/images/catalog/hemo-tube-k3edta.jpg',
    images: ['/images/catalog/hemo-tube-k3edta.jpg']
  },
  'HTK2E': {
    featuredImage: '/images/catalog/hemo-tube-k2edta.jpg',
    images: ['/images/catalog/hemo-tube-k2edta.jpg']
  },
  'HTBCA': {
    featuredImage: '/images/catalog/hemo-tube-clot-activator.jpg',
    images: ['/images/catalog/hemo-tube-clot-activator.jpg']
  },
  'HTFL': {
    featuredImage: '/images/catalog/hemo-tube-fluoride.jpg',
    images: ['/images/catalog/hemo-tube-fluoride.jpg']
  },
  'HT-HEPARIN': {
    featuredImage: '/images/catalog/hemo-tube-heparin.jpg',
    images: ['/images/catalog/hemo-tube-heparin.jpg']
  },
  'HTSST': {
    featuredImage: '/images/catalog/hemo-tube-sst-gel.jpg',
    images: ['/images/catalog/hemo-tube-sst-gel.jpg']
  },
  'HTESR': {
    featuredImage: '/images/catalog/hemo-tube-esr-ptt.jpg',
    images: ['/images/catalog/hemo-tube-esr-ptt.jpg', '/images/catalog/img_037_472x720.jpg']
  },

  // SECTION 3: SAMPLE TRANSPORT
  'MBSCVAC': {
    featuredImage: '/images/catalog/closed-system-urine-container.jpg',
    images: ['/images/catalog/closed-system-urine-container.jpg', '/images/catalog/hemovac-urine-tube.jpg']
  },
  'MBSC-SERIES': {
    featuredImage: '/images/catalog/specimen-containers-clicklock.jpg',
    images: ['/images/catalog/specimen-containers-clicklock.jpg', '/images/catalog/img_042_733x884.jpg']
  },
  'MBHP50': {
    featuredImage: '/images/catalog/hemo-porter-cool-case.jpg',
    images: ['/images/catalog/hemo-porter-cool-case.jpg', '/images/catalog/img_004_634x914.jpg']
  },
  'MBPB10': {
    featuredImage: '/images/catalog/phlebotomy-transport-bag.jpg',
    images: ['/images/catalog/phlebotomy-transport-bag.jpg', '/images/catalog/hemo-porter-cool-case.jpg']
  },

  // SECTION 4: GENERAL LAB-WARES
  'MBCT-SERIES': {
    featuredImage: '/images/catalog/centrifuge-tubes-conical.jpg',
    images: ['/images/catalog/centrifuge-tubes-conical.jpg', '/images/centrifuge.jpg']
  },
  'MBTT-SERIES': {
    featuredImage: '/images/catalog/plastic-test-tubes-ria.jpg',
    images: ['/images/catalog/plastic-test-tubes-ria.jpg', '/images/catalog/img_055_494x280.jpg']
  },
  'MBSS13100EO': {
    featuredImage: '/images/catalog/swab-stick-pp-tube.jpg',
    images: ['/images/catalog/swab-stick-pp-tube.jpg']
  },
  'MBMP1275': {
    featuredImage: '/images/catalog/convertible-multipurpose-vial.jpg',
    images: ['/images/catalog/convertible-multipurpose-vial.jpg', '/images/catalog/img_058_299x397.jpg']
  },
  'MBPD-SERIES': {
    featuredImage: '/images/catalog/petri-dishes-ultra-flat.jpg',
    images: ['/images/catalog/petri-dishes-ultra-flat.jpg', '/images/catalog/img_060_515x515.jpg', '/images/catalog/img_061_1436x409.jpg']
  },
  'MBESR': {
    featuredImage: '/images/catalog/esr-pipettes-graduated.jpg',
    images: ['/images/catalog/esr-pipettes-graduated.jpg']
  },
  'MBMPT-SERIES': {
    featuredImage: '/images/catalog/micropipette-tips-graduated.jpg',
    images: ['/images/catalog/micropipette-tips-graduated.jpg', '/images/catalog/img_064_286x286.jpg']
  },
  'MBSC-MBMCT': {
    featuredImage: '/images/catalog/sample-cups-mct-tubes.jpg',
    images: ['/images/catalog/sample-cups-mct-tubes.jpg', '/images/catalog/img_065_242x348.jpg']
  },

  // SECTION 5: HISTOPATHOLOGY & PHLEBOTOMY ACCESSORIES
  'MBEC-SERIES': {
    featuredImage: '/images/catalog/histopathology-embedding-cassettes.jpg',
    images: ['/images/catalog/histopathology-embedding-cassettes.jpg']
  },
  'MBER': {
    featuredImage: '/images/catalog/histopathology-embedding-rings.jpg',
    images: ['/images/catalog/histopathology-embedding-rings.jpg']
  },
  'MBNG-SERIES': {
    featuredImage: '/images/catalog/nitrile-examination-gloves.jpg',
    images: ['/images/catalog/nitrile-examination-gloves.jpg']
  },
  'MBAPS-MBSB': {
    featuredImage: '/images/catalog/phlebotomy-alcohol-prep-swabs.jpg',
    images: ['/images/catalog/phlebotomy-alcohol-prep-swabs.jpg']
  },
  'MBSYR-SERIES': {
    featuredImage: '/images/catalog/disposable-hypodermic-syringes.jpg',
    images: ['/images/catalog/disposable-hypodermic-syringes.jpg', '/images/catalog/img_071_559x559.jpg']
  }
};

async function updateProductImages() {
  console.log('[Update Images] Connecting to MongoDB...');
  await connectDB();

  try {
    let updatedCount = 0;

    for (const [sku, imgData] of Object.entries(productImages)) {
      const result = await Product.updateOne(
        { sku },
        {
          $set: {
            featuredImage: imgData.featuredImage,
            images: imgData.images
          }
        }
      );

      if (result.matchedCount > 0) {
        console.log(`[OK] Updated images for SKU: ${sku} -> ${imgData.featuredImage}`);
        updatedCount++;
      } else {
        console.warn(`[WARN] No product matched SKU: ${sku}`);
      }
    }

    console.log(`\n[SUCCESS] Updated ${updatedCount} products in MongoDB with their exact catalog images!`);
  } catch (err) {
    console.error('[ERROR] Failed to update product images:', err);
  } finally {
    await closeDB();
  }
}

updateProductImages().catch(console.error);
