import Category from "@/models/Category";
import { categoryUrl } from "@/lib/categoryLinks";
import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import connectDB from "@/app/lib/db/mongodb";
import Product from "@/app/models/Product";
import ProductDetail from "@/app/components/product/ProductDetail";
import JsonLd from "@/app/components/JsonLd";
import { DISPLAY_CURRENCY } from "@/app/lib/checkout/constants";
import { absoluteUrl, cleanSeoText, createPageMetadata, DEFAULT_DESCRIPTION, SITE_NAME } from "@/app/lib/seo";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

const findPublishedProduct = cache(async (slug: string) => {
  await connectDB();
  return Product.findOne({ slug, isActive: { $ne: false } });
});

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await findPublishedProduct(slug);

  if (!product) {
    return createPageMetadata({
      title: "Product Not Found",
      description: "The requested 8-Gear product could not be found.",
      path: `/product/${encodeURIComponent(slug)}`,
      noIndex: true,
      image: null,
    });
  }

  const description = cleanSeoText(product.baseDescription || product.fullDescription) || DEFAULT_DESCRIPTION;
  const title = product.category ? `${product.title} – ${product.category}` : product.title;

  return createPageMetadata({
    title,
    description,
    path: `/product/${product.slug}`,
    image: product.variants?.[0]?.images?.[0] || undefined,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await findPublishedProduct(slug);
  if (!product) notFound();

  try {
    await Product.findByIdAndUpdate(product._id, { $inc: { "analytics.views": 1 } });
  } catch (analyticsError) {
    console.error("Analytics update failed:", analyticsError);
  }

  const relatedQuery: Record<string, unknown> = {
    _id: { $ne: product._id },
    isActive: { $ne: false },
  };
  if (product.category) relatedQuery.category = product.category;
  const relatedProducts = await Product.find(relatedQuery).limit(4).lean();

  const productUrl = absoluteUrl(`/product/${product.slug}`);
  const imageUrls = product.variants
    .flatMap((variant: { images?: string[] }) => variant.images || [])
    .filter(Boolean)
    .slice(0, 8)
    .map((image: string) => absoluteUrl(image) || image);
  const primaryVariant = product.variants?.[0];
  const category = product.category ? await Category.findOne({ name: product.category }) : null;
  const categoryPageUrl = category ? absoluteUrl(categoryUrl(String(category._id))) : null;

  const productSchema = productUrl
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": `${productUrl}#product`,
        name: product.title,
        description: cleanSeoText(product.fullDescription || product.baseDescription, 5000),
        url: productUrl,
        image: imageUrls,
        sku: primaryVariant?.sku || undefined,
        brand: { "@type": "Brand", name: product.brand || SITE_NAME },
        category: product.category || undefined,
        offers: primaryVariant
          ? {
              "@type": "Offer",
              url: productUrl,
              priceCurrency: DISPLAY_CURRENCY,
              price: primaryVariant.price,
              sku: primaryVariant.sku,
              availability: primaryVariant.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              itemCondition: "https://schema.org/NewCondition",
            }
          : undefined,
        aggregateRating:
          product.reviews?.reviewCount > 0 && product.reviews?.rating > 0
            ? {
                "@type": "AggregateRating",
                ratingValue: product.reviews.rating,
                reviewCount: product.reviews.reviewCount,
              }
            : undefined,
      }
    : null;

  const breadcrumbs = productUrl
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: product.category || "Collection", item: categoryPageUrl || absoluteUrl("/category") },
          { "@type": "ListItem", position: 3, name: product.title, item: productUrl },
        ],
      }
    : null;

  return (
    <main>
      {productSchema && breadcrumbs && <JsonLd data={[productSchema, breadcrumbs]} />}
      <ProductDetail
        product={JSON.parse(JSON.stringify(product))}
        relatedProducts={JSON.parse(JSON.stringify(relatedProducts))}
      />
    </main>
  );
}
