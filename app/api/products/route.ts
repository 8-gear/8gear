import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import mongoose from 'mongoose';
import { z } from 'zod';
import { requireAdminApi } from '@/lib/adminAuth';

import { productSchema } from '@/lib/validations/product';

export async function POST(req: Request) {
  try {
    const auth = await requireAdminApi('/admin/products');
    if ('error' in auth) return auth.error;
    await connectDB();
    const body = await req.json();
    
    const validatedData = productSchema.parse(body);
    
    // Check if slug already exists
    const existingProduct = await Product.findOne({ slug: validatedData.slug });
    if (existingProduct) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }

    const product = await Product.create(validatedData);
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('❌ PRODUCT CREATION ERROR:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    // Handle Mongoose duplicate key error (code 11000)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json({ error: `Duplicate value for ${field}. Please use a unique value.` }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    let category = searchParams.get('category');
    const categoryId = searchParams.get('categoryId');
    if (categoryId) {
      if (!mongoose.isObjectIdOrHexString(categoryId)) return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
      const selected = await Category.findById(categoryId);
      if (!selected) return NextResponse.json([]);
      category = selected.name;
    }
    
    const query = category
      ? { category, isActive: { $ne: false } }
      : { isActive: { $ne: false } };
    const productsQuery = Product.find(query).sort({ createdAt: -1 });
    const requestedLimit = Number(searchParams.get('limit'));
    if (Number.isSafeInteger(requestedLimit) && requestedLimit > 0) {
      productsQuery.limit(Math.min(requestedLimit, 100));
    }
    const products = await productsQuery;
    
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
