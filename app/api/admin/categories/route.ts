import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';
import mongoose from 'mongoose';
import { requireAdminApi } from '@/lib/adminAuth';

export async function GET() {
  try {
    const auth = await requireAdminApi(['/admin/categories', '/admin/products']);
    if ('error' in auth) return auth.error;
    await connectDB();
    const categories = await Category.find({}).sort({ name: 1 });
    return NextResponse.json(categories);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Category request failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdminApi('/admin/categories');
    if ('error' in auth) return auth.error;
    await connectDB();
    const body = await req.json();
    
    if (typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }
    const category = await Category.create({ name: body.name.trim(), description: body.description });
    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Category request failed' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireAdminApi('/admin/categories');
    if ('error' in auth) return auth.error;

    const body = await req.json().catch(() => null);
    if (!body || typeof body.id !== 'string' || !mongoose.isObjectIdOrHexString(body.id)) {
      return NextResponse.json({ error: 'Valid category ID required' }, { status: 400 });
    }
    if (typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }
    if (typeof body.description !== 'string') {
      return NextResponse.json({ error: 'Description must be text' }, { status: 400 });
    }
    await connectDB();
    // Products reference category names, so rename both atomically.
    const category = await mongoose.connection.transaction(async (session) => {
      const existing = await Category.findById(body.id).session(session);
      if (!existing) return null;

      const previousName = existing.name;
      existing.aliases = [...new Set([...(existing.aliases || []), existing.name])];
      existing.name = body.name.trim();
      existing.description = body.description.trim();
      await existing.save({ session });
      if (previousName !== existing.name) {
        await Product.updateMany(
          { category: previousName },
          { $set: { category: existing.name } },
          { session },
        );
      }
      return existing;
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json(category);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await requireAdminApi('/admin/categories');
    if ('error' in auth) return auth.error;
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    
    await Category.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Category deleted' });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Category request failed' }, { status: 500 });
  }
}
