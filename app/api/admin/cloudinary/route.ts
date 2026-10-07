import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import connectDB from '@/lib/db/mongodb';
import Product from '@/models/Product';
import { requireAdminApi } from '@/lib/adminAuth';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req: Request) {
  try {
    const auth = await requireAdminApi('/admin/products');
    if ('error' in auth) return auth.error;
    const { searchParams } = new URL(req.url);
    const nextCursor = searchParams.get('next_cursor');

    // Fetch resources from Cloudinary
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: '', // Can be adjusted to a specific folder if needed
      max_results: 50,
      next_cursor: nextCursor || undefined,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Cloudinary Fetch Error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load images' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdminApi('/admin/products');
    if ('error' in auth) return auth.error;

    const formData = await req.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'An image file is required' }, { status: 400 });
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, and WebP images can be uploaded' }, { status: 400 });
    }
    if (file.size > 1024 * 1024) {
      return NextResponse.json({ error: 'Optimized image must be 1 MB or smaller' }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await new Promise<{ secure_url: string; public_id: string; width: number; height: number }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'products',
          format: 'webp',
          transformation: [
            { width: 2400, height: 2400, crop: 'limit', quality: 'auto:good' },
          ],
        },
        (error, uploaded) => {
          if (error || !uploaded) return reject(error || new Error('Cloudinary upload failed'));
          resolve({
            secure_url: uploaded.secure_url,
            public_id: uploaded.public_id,
            width: uploaded.width,
            height: uploaded.height,
          });
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Image upload failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await requireAdminApi('/admin/products');
    if ('error' in auth) return auth.error;
    const body = await req.json();
    const requestedItems: Array<{ publicId: string; secureUrl: string }> = Array.isArray(body.items)
      ? body.items.slice(0, 100)
      : [{ publicId: body.publicId, secureUrl: body.secureUrl }];
    const items = requestedItems.filter((item) => item?.publicId && item?.secureUrl);

    if (items.length === 0) {
      return NextResponse.json({ error: 'At least one valid image is required' }, { status: 400 });
    }

    // Connect to DB to check usage
    await connectDB();

    // Check where this image is used across all products
    const productsUsingImages = await Product.find({
      $or: [
        { 'variants.images': { $in: items.map((item) => item.secureUrl) } },
        { 'closeUpSection.image': { $in: items.map((item) => item.secureUrl) } },
        { 'engineeredSection.image': { $in: items.map((item) => item.secureUrl) } },
        { 'lifestyleImage': { $in: items.map((item) => item.secureUrl) } },
        { 'stylishSection.mainImage': { $in: items.map((item) => item.secureUrl) } },
        { 'stylishSection.secondaryImage': { $in: items.map((item) => item.secureUrl) } },
        { 'bottomGallery': { $in: items.map((item) => item.secureUrl) } },
        { 'sizeChart': { $in: items.map((item) => item.secureUrl) } }
      ]
    }).select('title variants.images closeUpSection.image engineeredSection.image lifestyleImage stylishSection.mainImage stylishSection.secondaryImage bottomGallery sizeChart').lean();

    const serializedProducts = JSON.stringify(productsUsingImages);
    const blocked = items.filter((item) => serializedProducts.includes(item.secureUrl));
    const deletable = items.filter((item) => !blocked.some((blockedItem) => blockedItem.publicId === item.publicId));

    if (deletable.length > 0) {
      await cloudinary.api.delete_resources(deletable.map((item) => item.publicId), {
        resource_type: 'image',
        type: 'upload',
        invalidate: true,
      });
    }

    return NextResponse.json({
      message: `${deletable.length} image${deletable.length === 1 ? '' : 's'} deleted`,
      deleted: deletable.map((item) => item.publicId),
      blocked: blocked.map((item) => item.publicId),
    });
  } catch (error: unknown) {
    console.error('Cloudinary Delete Error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to delete image' }, { status: 500 });
  }
}
