import { categoryUrl } from "@/lib/categoryLinks";
import type { MetadataRoute } from 'next';
import connectDB from '@/app/lib/db/mongodb';
import Category from '@/app/models/Category';
import Product from '@/app/models/Product';
import { absoluteUrl, allowIndexing } from '@/app/lib/seo';

const publicRoutes = [
  '/',
  '/category',
  '/technology',
  '/sustainability',
  '/dealers',
  '/contact',
  '/warranty',
  '/return-policy',
  '/shopping-policy',
  '/privacy-policy',
  '/tncs',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!allowIndexing) return [];

  const staticEntries: MetadataRoute.Sitemap = publicRoutes.flatMap((path) => {
    const url = absoluteUrl(path);
    return url ? [{ url }] : [];
  });

  try {
    await connectDB();
    const [products, categories] = await Promise.all([
      Product.find({ isActive: { $ne: false } }).select('slug updatedAt').lean(),
      Category.find({}).select('name updatedAt').lean(),
    ]);

    const productEntries: MetadataRoute.Sitemap = products.flatMap((product) => {
      const url = absoluteUrl(`/product/${product.slug}`);
      return url ? [{ url, lastModified: product.updatedAt }] : [];
    });
    const categoryEntries: MetadataRoute.Sitemap = categories.flatMap((category) => {
      const url = absoluteUrl(categoryUrl(String(category._id)));
      return url ? [{ url, lastModified: category.updatedAt }] : [];
    });

    return [...staticEntries, ...categoryEntries, ...productEntries];
  } catch (error) {
    console.error('Unable to add database content to sitemap:', error);
    return staticEntries;
  }
}
