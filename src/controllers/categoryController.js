import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { logAuditAction } from '../utils/auditLogger.js';
import slugify from 'slugify';

// Public: Get all published categories
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ status: 'published' })
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    next(error);
  }
};

// Public: Get category by slug
export const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      slug: req.params.slug,
      status: 'published'
    }).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.'
      });
    }

    res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all categories with product count
export const getAdminCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1, createdAt: -1 }).lean();

    // Attach product count for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await Product.countDocuments({ category: cat._id });
        return {
          ...cat,
          productCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: categoriesWithCounts.length,
      categories: categoriesWithCounts
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Create category
export const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, image, status, displayOrder, seoTitle, seoDescription } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.'
      });
    }

    const finalSlug = slug
      ? slugify(slug, { lower: true, strict: true })
      : slugify(name, { lower: true, strict: true });

    const existing = await Category.findOne({ slug: finalSlug });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A category with this slug already exists.'
      });
    }

    const category = await Category.create({
      name,
      slug: finalSlug,
      description,
      image,
      status: status || 'published',
      displayOrder: displayOrder || 0,
      seoTitle,
      seoDescription
    });

    await logAuditAction({
      req,
      action: 'CATEGORY_CREATED',
      targetType: 'Category',
      targetId: category._id,
      details: { name: category.name, slug: category.slug }
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update category
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.slug) {
      updates.slug = slugify(updates.slug, { lower: true, strict: true });
      const existing = await Category.findOne({ slug: updates.slug, _id: { $ne: id } });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Slug is already used by another category.'
        });
      }
    }

    const category = await Category.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.'
      });
    }

    await logAuditAction({
      req,
      action: 'CATEGORY_UPDATED',
      targetType: 'Category',
      targetId: category._id,
      details: { name: category.name }
    });

    res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      category
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete category
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if products exist in category
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category: ${productCount} products are currently assigned to this category. Please reassign or delete them first.`
      });
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.'
      });
    }

    await logAuditAction({
      req,
      action: 'CATEGORY_DELETED',
      targetType: 'Category',
      targetId: id,
      details: { name: category.name }
    });

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
