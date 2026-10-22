import { Page } from '../models/Page.js';
import { logAuditAction } from '../utils/auditLogger.js';
import slugify from 'slugify';

export const DEFAULT_ABOUT_PAGE_DATA = {
  title: 'About SuppliMed',
  heroHeading: 'About SuppliMed',
  heroDescription:
    'SuppliMed, based in Pune, is dedicated to protecting and improving lives. For over a decade, we have been a leading provider of in-vitro diagnostic (IVD) reagents, CSSD consumables, and blood bank consumables, serving customers nationwide.',
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
  }
};

export const DEFAULT_BROCHURES_PAGE_DATA = {
  title: 'Official Product Catalogues & Brochures',
  heroHeading: 'Supplimed Product Brochures & Catalogues',
  heroDescription:
    'Access certified product specifications, color-coding protocols, draw volume tables, and clinical labware literature. Download instant digital copies or request printed copies for your facility.',
  heroImage: '',
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
  }
};

export const DEFAULT_CERTIFICATES_PAGE_DATA = {
  title: 'Quality & Regulatory Certificates',
  heroHeading: 'Quality Assurance & Regulatory Accreditations',
  heroDescription:
    'Every vacuum blood collection tube, specimen container, and diagnostic device from Supplimed is manufactured under strict ISO 13485:2016 and CDSCO quality standards.',
  heroImage: '',
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
  }
};

// Public: Get page by slug
export const getPageBySlug = async (req, res, next) => {
  try {
    let slug = req.params.slug;
    if (slug === 'brochure') slug = 'brochures';

    let page = await Page.findOne({
      slug: { $in: [slug, req.params.slug] },
      status: 'published'
    }).lean();

    if (!page) {
      if (slug === 'about') {
        page = {
          slug: 'about',
          pageType: 'about',
          ...DEFAULT_ABOUT_PAGE_DATA,
          status: 'published'
        };
      } else if (slug === 'brochures') {
        page = {
          slug: 'brochures',
          pageType: 'brochures',
          ...DEFAULT_BROCHURES_PAGE_DATA,
          status: 'published'
        };
      } else if (slug === 'certificates') {
        page = {
          slug: 'certificates',
          pageType: 'certificates',
          ...DEFAULT_CERTIFICATES_PAGE_DATA,
          status: 'published'
        };
      } else {
        return res.status(404).json({
          success: false,
          message: 'Page not found.'
        });
      }
    } else if (page.slug === 'about') {
      page = {
        ...page,
        heroHeading: page.heroHeading || DEFAULT_ABOUT_PAGE_DATA.heroHeading,
        heroDescription: page.heroDescription || DEFAULT_ABOUT_PAGE_DATA.heroDescription,
        sections: {
          ...DEFAULT_ABOUT_PAGE_DATA.sections,
          ...(page.sections || {})
        }
      };
    } else if (page.slug === 'brochures' || page.slug === 'brochure') {
      page = {
        ...page,
        heroHeading: page.heroHeading || DEFAULT_BROCHURES_PAGE_DATA.heroHeading,
        heroDescription: page.heroDescription || DEFAULT_BROCHURES_PAGE_DATA.heroDescription,
        sections: {
          ...DEFAULT_BROCHURES_PAGE_DATA.sections,
          ...(page.sections || {})
        }
      };
    } else if (page.slug === 'certificates') {
      page = {
        ...page,
        heroHeading: page.heroHeading || DEFAULT_CERTIFICATES_PAGE_DATA.heroHeading,
        heroDescription: page.heroDescription || DEFAULT_CERTIFICATES_PAGE_DATA.heroDescription,
        sections: {
          ...DEFAULT_CERTIFICATES_PAGE_DATA.sections,
          ...(page.sections || {})
        }
      };
    }

    res.status(200).json({
      success: true,
      page
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all pages
export const getAdminPages = async (req, res, next) => {
  try {
    const pages = await Page.find().sort({ displayOrder: 1, createdAt: -1 }).lean();
    res.status(200).json({
      success: true,
      count: pages.length,
      pages
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get page by ID
export const getAdminPageById = async (req, res, next) => {
  try {
    let page = await Page.findById(req.params.id);
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found.'
      });
    }

    if (page.slug === 'about') {
      const pageObj = page.toObject();
      pageObj.heroHeading = pageObj.heroHeading || DEFAULT_ABOUT_PAGE_DATA.heroHeading;
      pageObj.heroDescription = pageObj.heroDescription || DEFAULT_ABOUT_PAGE_DATA.heroDescription;
      pageObj.sections = {
        ...DEFAULT_ABOUT_PAGE_DATA.sections,
        ...(pageObj.sections || {})
      };
      return res.status(200).json({
        success: true,
        page: pageObj
      });
    }

    if (page.slug === 'brochures' || page.slug === 'brochure') {
      const pageObj = page.toObject();
      pageObj.heroHeading = pageObj.heroHeading || DEFAULT_BROCHURES_PAGE_DATA.heroHeading;
      pageObj.heroDescription = pageObj.heroDescription || DEFAULT_BROCHURES_PAGE_DATA.heroDescription;
      pageObj.sections = {
        ...DEFAULT_BROCHURES_PAGE_DATA.sections,
        ...(pageObj.sections || {})
      };
      return res.status(200).json({
        success: true,
        page: pageObj
      });
    }

    if (page.slug === 'certificates') {
      const pageObj = page.toObject();
      pageObj.heroHeading = pageObj.heroHeading || DEFAULT_CERTIFICATES_PAGE_DATA.heroHeading;
      pageObj.heroDescription = pageObj.heroDescription || DEFAULT_CERTIFICATES_PAGE_DATA.heroDescription;
      pageObj.sections = {
        ...DEFAULT_CERTIFICATES_PAGE_DATA.sections,
        ...(pageObj.sections || {})
      };
      return res.status(200).json({
        success: true,
        page: pageObj
      });
    }

    res.status(200).json({
      success: true,
      page
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Create page
export const createPage = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      pageType,
      heroHeading,
      heroDescription,
      heroImage,
      featuredImage,
      content,
      sections,
      callToActionText,
      callToActionUrl,
      status,
      showInNavigation,
      displayOrder,
      seoTitle,
      seoDescription,
      canonicalUrl,
      openGraphImage
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Page title is required.'
      });
    }

    const finalSlug = slug
      ? slugify(slug, { lower: true, strict: true })
      : slugify(title, { lower: true, strict: true });

    const existing = await Page.findOne({ slug: finalSlug });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A page with this slug already exists.'
      });
    }

    const page = await Page.create({
      title,
      slug: finalSlug,
      pageType: pageType || 'custom',
      heroHeading: heroHeading || '',
      heroDescription: heroDescription || '',
      heroImage: heroImage || '',
      featuredImage: featuredImage || '',
      content: content || '',
      sections: sections || {},
      callToActionText: callToActionText || '',
      callToActionUrl: callToActionUrl || '',
      status: status || 'published',
      showInNavigation: showInNavigation !== undefined ? showInNavigation : true,
      displayOrder: displayOrder || 0,
      seoTitle: seoTitle || '',
      seoDescription: seoDescription || '',
      canonicalUrl: canonicalUrl || '',
      openGraphImage: openGraphImage || ''
    });

    await logAuditAction({
      req,
      action: 'PAGE_CREATED',
      targetType: 'Page',
      targetId: page._id,
      details: { title: page.title, slug: page.slug }
    });

    res.status(201).json({
      success: true,
      message: 'Page created successfully.',
      page
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update page
export const updatePage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.slug) {
      updates.slug = slugify(updates.slug, { lower: true, strict: true });
      const existing = await Page.findOne({ slug: updates.slug, _id: { $ne: id } });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Slug is already used by another page.'
        });
      }
    }

    const page = await Page.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found.'
      });
    }

    await logAuditAction({
      req,
      action: 'PAGE_UPDATED',
      targetType: 'Page',
      targetId: page._id,
      details: { title: page.title, slug: page.slug }
    });

    res.status(200).json({
      success: true,
      message: 'Page updated successfully.',
      page
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete page
export const deletePage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = await Page.findById(id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found.'
      });
    }

    // Protect core system pages
    if (['home', 'about', 'contact', 'products', 'brochures', 'certificates'].includes(page.slug)) {
      return res.status(400).json({
        success: false,
        message: `Core system page "${page.slug}" cannot be deleted. You may edit or change its status to draft instead.`
      });
    }

    await Page.findByIdAndDelete(id);

    await logAuditAction({
      req,
      action: 'PAGE_DELETED',
      targetType: 'Page',
      targetId: id,
      details: { title: page.title }
    });

    res.status(200).json({
      success: true,
      message: 'Page deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Bulk delete pages (preserves core pages)
export const bulkDeletePages = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No page IDs provided.' });
    }

    const coreSlugs = ['home', 'about', 'contact', 'products', 'brochures', 'certificates'];
    const result = await Page.deleteMany({
      _id: { $in: ids },
      slug: { $nin: coreSlugs }
    });

    await logAuditAction({
      req,
      action: 'PAGES_BULK_DELETED',
      targetType: 'Page',
      details: { count: result.deletedCount, ids }
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} custom page(s). Core pages are protected and preserved.`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};
