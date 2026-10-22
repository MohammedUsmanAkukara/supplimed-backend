import { Navigation } from '../models/Navigation.js';
import { logAuditAction } from '../utils/auditLogger.js';

// Public: Get grouped navigation
export const getPublicNavigation = async (req, res, next) => {
  try {
    const items = await Navigation.find({ isActive: true }).sort({ order: 1, label: 1 }).lean();

    const grouped = {
      header: items.filter(i => i.placement === 'header'),
      footer_company: items.filter(i => i.placement === 'footer_company'),
      footer_categories: items.filter(i => i.placement === 'footer_categories'),
      footer_legal: items.filter(i => i.placement === 'footer_legal')
    };

    res.status(200).json({
      success: true,
      navigation: grouped
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all navigation items
export const getAdminNavigation = async (req, res, next) => {
  try {
    const items = await Navigation.find().sort({ placement: 1, order: 1 }).lean();
    res.status(200).json({
      success: true,
      items
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Create navigation item
export const createNavigationItem = async (req, res, next) => {
  try {
    const { placement, label, url, isExternal, order, isActive, children } = req.body;

    if (!label || !url) {
      return res.status(400).json({
        success: false,
        message: 'Label and URL are required.'
      });
    }

    const item = await Navigation.create({
      placement: placement || 'header',
      label,
      url,
      isExternal: !!isExternal,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      children: Array.isArray(children) ? children : []
    });

    await logAuditAction({
      req,
      action: 'NAV_CREATED',
      targetType: 'Navigation',
      targetId: item._id,
      details: { label: item.label, placement: item.placement }
    });

    res.status(201).json({
      success: true,
      message: 'Navigation item created successfully.',
      item
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update navigation item
export const updateNavigationItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Navigation.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Navigation item not found.'
      });
    }

    await logAuditAction({
      req,
      action: 'NAV_UPDATED',
      targetType: 'Navigation',
      targetId: item._id,
      details: { label: item.label }
    });

    res.status(200).json({
      success: true,
      message: 'Navigation item updated successfully.',
      item
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete navigation item
export const deleteNavigationItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Navigation.findByIdAndDelete(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Navigation item not found.'
      });
    }

    await logAuditAction({
      req,
      action: 'NAV_DELETED',
      targetType: 'Navigation',
      targetId: id,
      details: { label: item.label }
    });

    res.status(200).json({
      success: true,
      message: 'Navigation item deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Bulk reorder
export const reorderNavigationItems = async (req, res, next) => {
  try {
    const { items } = req.body; // Array of { id, order }

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required.'
      });
    }

    await Promise.all(
      items.map(item =>
        Navigation.findByIdAndUpdate(item.id, { order: item.order })
      )
    );

    res.status(200).json({
      success: true,
      message: 'Navigation reordered successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Bulk delete navigation items
export const bulkDeleteNavigationItems = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No navigation item IDs provided.' });
    }
    const result = await Navigation.deleteMany({ _id: { $in: ids } });
    await logAuditAction({
      req,
      action: 'NAV_ITEMS_BULK_DELETED',
      targetType: 'Navigation',
      details: { count: result.deletedCount, ids }
    });
    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} navigation item(s) successfully.`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};
