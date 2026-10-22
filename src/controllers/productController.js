import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { logAuditAction } from '../utils/auditLogger.js';
import slugify from 'slugify';

// Public: Get published products with filtering, search, pagination
export const getProducts = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 12, sort = 'displayOrder' } = req.query;

    const query = { status: 'published' };

    // Filter by Category
    if (category && category !== 'all') {
      let catDoc = await Category.findOne({ slug: category });
      if (!catDoc && category.match(/^[0-9a-fA-F]{24}$/)) {
        catDoc = await Category.findById(category);
      }
      if (catDoc) {
        query.category = catDoc._id;
      } else {
        return res.status(200).json({
          success: true,
          products: [],
          pagination: { total: 0, page: 1, pages: 1, limit: Number(limit) }
        });
      }
    }

    // Search by text or name regex
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { shortDescription: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Sort order
    let sortObj = { displayOrder: 1, createdAt: -1 };
    if (sort === 'newest') sortObj = { createdAt: -1 };
    if (sort === 'name_asc') sortObj = { name: 1 };
    if (sort === 'name_desc') sortObj = { name: -1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

// Public: Get featured products
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ status: 'published', isFeatured: true })
      .populate('category', 'name slug')
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(6)
      .lean();

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
};

// Public: Get product by slug
export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      status: 'published'
    }).populate('category', 'name slug description');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    // Related products in same category
    const relatedProducts = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      status: 'published'
    })
      .limit(4)
      .lean();

    res.status(200).json({
      success: true,
      product,
      relatedProducts
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all products with filters
export const getAdminProducts = async (req, res, next) => {
  try {
    const { status, category, search, page = 1, limit = 20, sort = 'createdAt_desc' } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { sku: { $regex: search.trim(), $options: 'i' } },
        { shortDescription: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'displayOrder') sortObj = { displayOrder: 1, createdAt: -1 };
    if (sort === 'name') sortObj = { name: 1 };
    if (sort === 'createdAt_asc') sortObj = { createdAt: 1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get product by ID
export const getAdminProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Create product
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      sku,
      category,
      shortDescription,
      description,
      packSize,
      featuredImage,
      images,
      specifications,
      attributes,
      status,
      isFeatured,
      displayOrder,
      seoTitle,
      seoDescription,
      canonicalUrl
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Product name and category are required.'
      });
    }

    // Verify category exists
    const catExists = await Category.findById(category);
    if (!catExists) {
      return res.status(400).json({
        success: false,
        message: 'Selected category does not exist.'
      });
    }

    let finalSlug = slug
      ? slugify(slug, { lower: true, strict: true })
      : slugify(name, { lower: true, strict: true });

    const existingSlug = await Product.findOne({ slug: finalSlug });
    if (existingSlug) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    // Auto-clean specifications and attributes to prevent validation errors
    const cleanSpecs = Array.isArray(specifications)
      ? specifications.filter((s) => s && typeof s.key === 'string' && s.key.trim() && typeof s.value === 'string' && s.value.trim())
      : [];
    const cleanAttrs = Array.isArray(attributes)
      ? attributes.filter((a) => a && typeof a.name === 'string' && a.name.trim() && typeof a.value === 'string' && a.value.trim())
      : [];

    const product = await Product.create({
      name,
      slug: finalSlug,
      sku: sku || '',
      category,
      shortDescription: shortDescription || '',
      description: description || '',
      packSize: packSize || '',
      featuredImage: featuredImage || '',
      images: Array.isArray(images) ? images : [],
      specifications: cleanSpecs,
      attributes: cleanAttrs,
      status: status || 'published',
      isFeatured: !!isFeatured,
      displayOrder: displayOrder || 0,
      seoTitle: seoTitle || '',
      seoDescription: seoDescription || '',
      canonicalUrl: canonicalUrl || '',
      publishedAt: status === 'published' ? new Date() : null
    });

    await logAuditAction({
      req,
      action: 'PRODUCT_CREATED',
      targetType: 'Product',
      targetId: product._id,
      details: { name: product.name, slug: product.slug }
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update product
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.category) {
      const catExists = await Category.findById(updates.category);
      if (!catExists) {
        return res.status(400).json({
          success: false,
          message: 'Selected category does not exist.'
        });
      }
    }

    if (updates.slug) {
      updates.slug = slugify(updates.slug, { lower: true, strict: true });
      const existingSlug = await Product.findOne({ slug: updates.slug, _id: { $ne: id } });
      if (existingSlug) {
        return res.status(409).json({
          success: false,
          message: 'Slug is already used by another product.'
        });
      }
    }

    if (updates.specifications && Array.isArray(updates.specifications)) {
      updates.specifications = updates.specifications.filter(
        (s) => s && typeof s.key === 'string' && s.key.trim() && typeof s.value === 'string' && s.value.trim()
      );
    }

    if (updates.attributes && Array.isArray(updates.attributes)) {
      updates.attributes = updates.attributes.filter(
        (a) => a && typeof a.name === 'string' && a.name.trim() && typeof a.value === 'string' && a.value.trim()
      );
    }

    if (updates.status === 'published') {
      const current = await Product.findById(id);
      if (current && !current.publishedAt) {
        updates.publishedAt = new Date();
      }
    }

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    }).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    await logAuditAction({
      req,
      action: 'PRODUCT_UPDATED',
      targetType: 'Product',
      targetId: product._id,
      details: { name: product.name, status: product.status }
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete product
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    await logAuditAction({
      req,
      action: 'PRODUCT_DELETED',
      targetType: 'Product',
      targetId: id,
      details: { name: product.name }
    });

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Bulk delete products
export const bulkDeleteProducts = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No product IDs provided.' });
    }
    const result = await Product.deleteMany({ _id: { $in: ids } });
    await logAuditAction({
      req,
      action: 'PRODUCTS_BULK_DELETED',
      targetType: 'Product',
      details: { count: result.deletedCount, ids }
    });
    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} product(s) successfully.`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};
