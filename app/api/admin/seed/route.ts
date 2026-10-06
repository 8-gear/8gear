import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { requireAdminApi } from '@/lib/adminAuth';

export async function POST() {
  try {
    const auth = await requireAdminApi('/admin/users', true);
    if ('error' in auth) return auth.error;
    await connectDB();
    
    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Create Categories
    await Category.insertMany([
      { name: 'Helmets', description: 'Professional grade safety helmets.' },
      { name: 'Gloves', description: 'Abrasion resistant riding gloves.' },
      { name: 'Jackets', description: 'Weatherproof armored jackets.' },
      { name: 'Boots', description: 'Reinforced protective footwear.' },
    ]);

    // Create Sample Products
    const products = [
      {
        title: 'Apex Carbon Racing Helmet',
        slug: 'apex-carbon-racing-helmet',
        category: 'Helmets',
        brand: '8 GEARS',
        baseDescription: 'Ultra-lightweight carbon fiber helmet for high-speed track performance.',
        fullDescription: 'The Apex Carbon series represents the pinnacle of safety and aerodynamics. Engineered with dual-density EPS and a reinforced carbon shell.',
        tags: ['carbon', 'racing', 'professional'],
        technicalSpecifications: [
          { title: 'Material', description: '3K Carbon Fiber' },
          { title: 'Certification', description: 'ECE 22.06' }
        ],
        materialCare: {
          composition: 'Carbon Fiber Outer',
          careInstructions: 'Clean with mild soap.'
        },
        narrativeSection: 'Born on the track.',
        advantages: [
          { title: 'Aero-tuned', description: 'Reduced drag.' }
        ],
        logistics: {
          shipping: 'Ships in 3-5 days.',
          returns: '30-day return.'
        },
        variants: [
          {
            color: 'Matte Black',
            size: 'L',
            price: 45000,
            comparePrice: 52000,
            stockQuantity: 15,
            sku: 'HELM-APX-MBK-L',
            images: ['https://images.unsplash.com/photo-1544372017-062402133887?q=80&w=1000']
          },
          {
            color: 'Matte Black',
            size: 'M',
            price: 45000,
            comparePrice: 52000,
            stockQuantity: 5,
            sku: 'HELM-APX-MBK-M',
            images: ['https://images.unsplash.com/photo-1544372017-062402133887?q=80&w=1000']
          }
        ]
      }
    ];

    await Product.insertMany(products);
    
    return NextResponse.json({ message: 'Database Seeded Successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
