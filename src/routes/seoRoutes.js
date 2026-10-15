import express from 'express';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Page } from '../models/Page.js';
import { Setting } from '../models/Setting.js';

const router = express.Router();

router.get('/sitemap.xml', async (req, res, next) => {
  try {
    const settings = await Setting.findOne({ key: 'global_settings' }).lean();
    const baseUrl = settings?.canonicalBaseUrl || 'https://supplimed-website.vercel.app';

    const [products, categories, pages] = await Promise.all([
      Product.find({ status: 'published' }).select('slug updatedAt').lean(),
      Category.find({ status: 'published' }).select('slug updatedAt').lean(),
      Page.find({ status: 'published' }).select('slug updatedAt').lean()
    ]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static core pages
    const staticRoutes = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/products', priority: '0.9', changefreq: 'daily' },
      { url: '/about', priority: '0.8', changefreq: 'weekly' },
      { url: '/contact', priority: '0.8', changefreq: 'monthly' }
    ];

    const today = new Date().toISOString().split('T')[0];

    staticRoutes.forEach(route => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${route.url}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    // Dynamic products
    products.forEach(prod => {
      const lastmod = prod.updatedAt ? new Date(prod.updatedAt).toISOString().split('T')[0] : today;
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/products/${prod.slug}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    // Dynamic categories
    categories.forEach(cat => {
      const lastmod = cat.updatedAt ? new Date(cat.updatedAt).toISOString().split('T')[0] : today;
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/products?category=${cat.slug}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    });

    // Dynamic custom pages
    pages.forEach(pg => {
      if (!['home', 'about', 'contact', 'products'].includes(pg.slug)) {
        const lastmod = pg.updatedAt ? new Date(pg.updatedAt).toISOString().split('T')[0] : today;
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/pages/${pg.slug}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.6</priority>\n`;
        xml += `  </url>\n`;
      }
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    next(error);
  }
});

router.get('/robots.txt', async (req, res, next) => {
  try {
    const settings = await Setting.findOne({ key: 'global_settings' }).lean();
    const baseUrl = settings?.canonicalBaseUrl || 'https://supplimed-website.vercel.app';

    const robots = [
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin',
      'Disallow: /admin/*',
      'Disallow: /api/*',
      '',
      `Sitemap: ${baseUrl}/sitemap.xml`
    ].join('\n');

    res.header('Content-Type', 'text/plain');
    res.send(robots);
  } catch (error) {
    next(error);
  }
});

export default router;
