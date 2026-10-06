import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

// Schemas matching app/models/Product.ts and app/models/Category.ts
const VariantSchema = new mongoose.Schema({
  color: { type: String, required: true },
  colorHex: { type: String, default: '#000000' },
  size: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  comparePrice: { type: Number },
  stockQuantity: { type: Number, required: true, default: 10 },
  sku: { type: String, required: true },
  images: { type: [String], default: [] },
});

const ProductSchema = new mongoose.Schema({
  isActive: { type: Boolean, default: true, index: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  baseDescription: { type: String, required: true },
  fullDescription: { type: String, required: true },
  brand: { type: String, required: true, default: '8 GEAR' },
  tags: { type: [String], default: [] },
  variants: [VariantSchema],
  materialCare: {
    composition: { type: String, required: true },
    careInstructions: { type: String, required: true },
  },
  advantages: [
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
    },
  ],
  logistics: {
    shipping: { type: String, required: true },
    returns: { type: String, required: true },
  },
  closeUpSection: [{ image: String, title: String, description: String }],
  engineeredSection: { title: String, description: String, image: String },
  lifestyleImage: { type: String, default: '' },
  stylishSection: { title: String, description: String, mainImage: String, secondaryImage: String },
  bottomGallery: { type: [String], default: [] },
  reviews: { rating: { type: Number, default: 4.8 }, reviewCount: { type: Number, default: 12 } },
  analytics: { totalSold: { type: Number, default: 0 }, views: { type: Number, default: 0 } },
  sizeChart: { type: String, default: '' },
}, { timestamps: true });

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

const productsData = [
  {
    title: 'Urban Fit Denim Jeans with Kevlar®',
    slug: 'urban-fit-denim-jeans-with-kevlar',
    category: 'Denim With Kevlar',
    brand: '8 GEAR',
    baseDescription: 'Kevlar®-lined construction delivering elevated abrasion and tear resistance while preserving flexibility and breathability for refined everyday riding.',
    fullDescription: 'Engineered where technical performance meets timeless design, 8 Gear Protective Motorcycle Jeans bring advanced road protection to classic denim. Features 75% Kevlar® protective lining, Level 2 hip armor pockets, and Level 2 adjustable knee armors in a premium stretch denim shell.',
    tags: ['denim', 'kevlar', 'motorcycle jeans', 'streetwear', 'protection'],
    materialCare: {
      composition: '75% Kevlar® Protective Lining, Premium Stretch Denim Outer Shell',
      careInstructions: 'Machine wash cold, air dry. Remove armors before washing.',
    },
    advantages: [
      { title: '75% Kevlar® Lining', description: 'High-strength aramid fiber protection in key impact and slide zones.' },
      { title: 'Level 2 Protection', description: 'Level 2 hip armor pockets and Level 2 adjustable knee armors.' },
      { title: 'CE Class AA Certified', description: 'Certified under EN 17092-2:2020.' },
    ],
    logistics: {
      shipping: 'Standard shipping available.',
      returns: '30-day return policy for unwashed, unused items with tags.',
    },
    variants: [
      { color: 'Indigo Blue', colorHex: '#1d3557', size: '32', price: 0, stockQuantity: 10, sku: '8G-KEV-UF-ID', images: [] },
      { color: 'Grey', colorHex: '#6c757d', size: '32', price: 0, stockQuantity: 10, sku: '8G-KEV-UF-GR', images: [] },
      { color: 'Jet Black', colorHex: '#111111', size: '32', price: 0, stockQuantity: 10, sku: '8G-KEV-UF-JB', images: [] },
      { color: 'Medium Blue', colorHex: '#457b9d', size: '32', price: 0, stockQuantity: 10, sku: '8G-KEV-UF-MB', images: [] },
      { color: 'Vintage Brown', colorHex: '#5c4033', size: '32', price: 0, stockQuantity: 10, sku: '8G-KEV-UF-VB', images: [] },
      { color: 'Charcoal Grey', colorHex: '#343a40', size: '32', price: 0, stockQuantity: 10, sku: '8G-KEV-UF-CHG', images: [] },
    ],
  },
  {
    title: 'Single Layer Denim Jeans with Dyneema®',
    slug: 'single-layer-denim-jeans-with-dyneema',
    category: 'Single Layer Denim',
    brand: '8 GEAR',
    baseDescription: 'Constructed from high-performance Dyneema®-blended denim with protective strength integrated directly into the fabric weave.',
    fullDescription: 'Advanced single-layer denim construction eliminates the need for bulky inner linings while maintaining flexibility, breathability, and the authentic look of traditional denim. Features 100% Dyneema® fabric reinforcement in zone 1, natural stretch for unrestricted movement, Level 2 hip armor pockets, and Level 2 adjustable knee armors.',
    tags: ['dyneema', 'single-layer', 'denim', 'protection', 'riding-jeans'],
    materialCare: {
      composition: 'Dyneema® Blended Denim (100% Dyneema® in Zone 1)',
      careInstructions: 'Machine wash cold with mild detergent. Hang to dry.',
    },
    advantages: [
      { title: 'Integrated Dyneema®', description: 'Protective strength woven directly into the denim fabric.' },
      { title: 'CE Class AAA Certified', description: 'Certified to CE Class AAA – EN 17092-2:2020.' },
      { title: 'Lightweight & Breathable', description: 'No bulky inner lining required.' },
    ],
    logistics: {
      shipping: 'Standard shipping available.',
      returns: '30-day return policy for unwashed, unused items with tags.',
    },
    variants: [
      { color: 'Charcoal Grey', colorHex: '#343a40', size: '32', price: 0, stockQuantity: 10, sku: '8G-DYN-SL-GR', images: [] },
      { color: 'Vintage Brown', colorHex: '#5c4033', size: '32', price: 0, stockQuantity: 10, sku: '8G-DYN-SL-VB', images: [] },
      { color: 'Jet Black', colorHex: '#111111', size: '32', price: 0, stockQuantity: 10, sku: '8G-DYN-SL-JB', images: [] },
      { color: 'Charcoal Grey', colorHex: '#212529', size: '32', price: 0, stockQuantity: 10, sku: '8G-DYN-SL-CHG', images: [] },
    ],
  },
  {
    title: 'Café Racer Kevlar Jeans with Selvedge Denim',
    slug: 'cafe-racer-kevlar-jeans-with-selvedge-denim',
    category: 'Denim With Kevlar',
    brand: '8 GEAR',
    baseDescription: 'Combining a timeless selvedge denim silhouette with motorcycle-ready protection and authentic handcrafted details.',
    fullDescription: 'Built for the rider who appreciates clean design, authentic character, and dependable protection without compromising style. Woven on traditional shuttle looms with a clean self-finished edge that does not fray. Features Kevlar® protective lining and CE Level 2 armors.',
    tags: ['cafe-racer', 'selvedge', 'kevlar', 'denim', 'vintage'],
    materialCare: {
      composition: 'Selvedge Cotton Denim, Kevlar® Protective Lining',
      careInstructions: 'Wash infrequently inside-out in cold water to preserve selvedge character.',
    },
    advantages: [
      { title: 'Traditional Selvedge', description: 'Woven on shuttle looms with self-finished edge that resists fraying.' },
      { title: 'Kevlar® Protection', description: 'Kevlar® lined for abrasion resistance.' },
      { title: 'CE Level 2 Armors', description: 'Includes Level 2 armor protection.' },
    ],
    logistics: {
      shipping: 'Standard shipping available.',
      returns: '30-day return policy for unwashed, unused items with tags.',
    },
    variants: [
      { color: 'Jet Black', colorHex: '#111111', size: '32', price: 0, stockQuantity: 10, sku: '8G-KEV-CR-JB', images: [] },
      { color: 'Medium Blue', colorHex: '#457b9d', size: '32', price: 0, stockQuantity: 10, sku: '8G-KEV-CR-MB', images: [] },
      { color: 'Indigo Blue', colorHex: '#1d3557', size: '32', price: 0, stockQuantity: 10, sku: '8G-KEV-CR-ID', images: [] },
    ],
  },
  {
    title: 'Hudson Chino’s — Slim Straight Fit',
    slug: 'hudson-chinos-slim-straight-fit',
    category: "Chinow's",
    brand: '8 GEAR',
    baseDescription: "Refined everyday chino built for riders who don't change identity off the bike, combining classic styling with certified protection.",
    fullDescription: "The Hudson Chino brings the clean, understated character of classic chinos together with modern rider DNA. Features premium waistband and stitching construction, subtle branding without excessive logos, stretch and articulated fit, Kevlar® protective lining, and CE Class AA certification.",
    tags: ['chinos', 'kevlar', 'urban-riding', 'casual', 'protection'],
    materialCare: {
      composition: 'Cotton-blend Chino Fabric with Kevlar® Protective Lining',
      careInstructions: 'Machine wash cold. Do not bleach. Air dry.',
    },
    advantages: [
      { title: 'Understated Style', description: 'Avoids excessive logos and pockets for seamless transition off the bike.' },
      { title: 'Comfort & Movement', description: 'Articulated construction with subtle stretch.' },
      { title: 'CE Class AA Certified', description: 'Certified for motorcycle road use with Level 2 armors.' },
    ],
    logistics: {
      shipping: 'Standard shipping available.',
      returns: '30-day return policy for unwashed, unused items with tags.',
    },
    variants: [
      { color: 'Black', colorHex: '#111111', size: '32', price: 0, stockQuantity: 10, sku: '8G-KEV-CH-BK', images: [] },
      { color: 'Khaki', colorHex: '#c2b280', size: '32', price: 0, stockQuantity: 10, sku: '8G-KEV-CH-KHK', images: [] },
    ],
  },
  {
    title: 'Ridge Cargo — Semi-Lined Kevlar Riding Cargo',
    slug: 'ridge-cargo-semi-lined-kevlar-riding-cargo',
    category: "Cargo's",
    brand: '8 GEAR',
    baseDescription: 'Classic fit motorcycle twill cargo pants combining rugged utility, everyday comfort, and motorcycle-ready performance.',
    fullDescription: 'Inspired by classic cargo trousers, these pants are made from a cotton-blend diagonal-rib twill weave fabric offering structured feel and durability. Features 75% coverage Kevlar® lining, removable CE Level 2 knee and hip armor, Velcro® pocket snap, and multi-layer construction with strengthened stitching in high-stress zones.',
    tags: ['cargo', 'twill', 'kevlar', 'riding-pants', 'classic-fit'],
    materialCare: {
      composition: 'Cotton-blend Twill Outer Shell, 75% Kevlar® Protective Lining',
      careInstructions: 'Machine wash cold inside-out. Hang dry.',
    },
    advantages: [
      { title: '75% Kevlar® Coverage', description: 'Protective strength layered exactly where needed for road riding.' },
      { title: 'CE Level 2 Armor', description: 'Removable low-profile protectors at knee and hip.' },
      { title: 'Rugged Utility', description: 'Velcro® pocket snaps and reinforced multi-layer construction.' },
    ],
    logistics: {
      shipping: 'Standard shipping available.',
      returns: '30-day return policy for unwashed, unused items with tags.',
    },
    variants: [
      { color: 'Brown', colorHex: '#5c4033', size: '32', price: 0, stockQuantity: 10, sku: '8G-KEV-CT-BR', images: [] },
      { color: 'Black', colorHex: '#111111', size: '32', price: 0, stockQuantity: 10, sku: '8G-KEV-CT-BK', images: [] },
    ],
  },
  {
    title: 'Cotex Cargo Kevlar® Cotton Poly Cargo',
    slug: 'cotex-cargo-kevlar-cotton-poly-cargo',
    category: "Cargo's",
    brand: '8 GEAR',
    baseDescription: 'Cotton-polyester blend motorcycle cargo pants balancing everyday comfort, resilience, and freedom of movement with certified protection.',
    fullDescription: 'Designed for utility without compromise. Certified to CE Class AA – EN 17092-3:2020. Features 75% Kevlar® protective lining, Level 2 hip and adjustable knee armors, reflective lining on pockets for safety, rider-focused classic fit, and Velcro® adjustable bottom hem.',
    tags: ['cargo', 'cotton-poly', 'kevlar', 'reflective', 'protection'],
    materialCare: {
      composition: 'Cotton-Polyester Blend, 75% Kevlar® Protective Lining',
      careInstructions: 'Machine wash cold. Do not tumble dry.',
    },
    advantages: [
      { title: 'CE Class AA Certified', description: 'EN 17092-3:2020 certified for motorcycle road use.' },
      { title: 'Reflective Pocket Details', description: 'Reflective lining on pockets for enhanced night visibility.' },
      { title: 'Adjustable Hem', description: 'Velcro® adjustable bottom hem for custom ankle fit.' },
    ],
    logistics: {
      shipping: 'Standard shipping available.',
      returns: '30-day return policy for unwashed, unused items with tags.',
    },
    variants: [
      { color: 'Grey', colorHex: '#6c757d', size: '32', price: 0, stockQuantity: 10, sku: '8G-KEV-CP-CG-GR', images: [] },
      { color: 'Black', colorHex: '#111111', size: '32', price: 0, stockQuantity: 10, sku: '8G-KEV-CP-CG-BK', images: [] },
    ],
  },
  {
    title: 'Monet Kevlar® Fleece Cargo',
    slug: 'monet-kevlar-fleece-cargo',
    category: 'Fleece',
    brand: '8 GEAR',
    baseDescription: 'Certified motorcycle protection in a refined, street-ready fleece cargo design eliminating unnecessary bulk.',
    fullDescription: 'Created for commuting, urban riding, and daily use with water-repellent finish, reflective lining on pockets, elastic waistband with drawstring and belt loops, back pocket flap detail, cargo pocket detail, lower leg zipper detail for armor ventilation, and adjustable ankle with Velcro. Features strategically integrated Kevlar® panels at knee and hip.',
    tags: ['fleece', 'cargo', 'kevlar', 'water-repellent', 'streetwear'],
    materialCare: {
      composition: 'Fleece Fabric, Kevlar® Reinforced Panels at Knee & Hip',
      careInstructions: 'Machine wash cold on gentle cycle. Do not iron directly on print or DWR.',
    },
    advantages: [
      { title: 'CE Class AA Certified', description: 'Highest certified level EN 17092-3:2020 for fleece riding apparel.' },
      { title: 'Water Repellent Finish', description: 'EU-certified Durable Water Repellent coating.' },
      { title: 'Armor Ventilation Zipper', description: 'Lower leg zipper detail for armor positioning and ventilation.' },
    ],
    logistics: {
      shipping: 'Standard shipping available.',
      returns: '30-day return policy for unwashed, unused items with tags.',
    },
    variants: [
      { color: 'Grey', colorHex: '#6c757d', size: 'M', price: 0, stockQuantity: 10, sku: '8G-KEV-FL-CG-GR', images: [] },
      { color: 'Black', colorHex: '#111111', size: 'M', price: 0, stockQuantity: 10, sku: '8G-KEV-FL-CG-BK', images: [] },
    ],
  },
  {
    title: 'Raven Kevlar® Hoodie',
    slug: 'raven-kevlar-hoodie',
    category: 'Hoodies',
    brand: '8 GEAR',
    baseDescription: 'Intelligent riding hoodie engineered for real roads, combining certified protection with everyday fleece comfort and style.',
    fullDescription: 'Constructed from a lightweight, UV-resistant cotton/polyester blend exterior with breathable mesh lining and soft interior finish. Includes CE Level 2 protectors (shoulders, elbows, back), water-repellent finish, 3M reflective details, secure belt connection system to attach to riding pants, thumb loop sleeves, streamlined hood, and water-resistant zippered pockets.',
    tags: ['hoodie', 'kevlar', 'water-repellent', 'protection', 'reflective'],
    materialCare: {
      composition: 'Cotton/Polyester Blend Outer, Breathable Mesh Lining, Kevlar® Panels',
      careInstructions: 'Remove armors before washing. Machine wash cold, line dry.',
    },
    advantages: [
      { title: 'CE Level 2 Protection', description: 'Includes Level 2 protectors for shoulders, elbows, and back.' },
      { title: 'Secure Belt Connection', description: 'Integrated belt connection loops prevent jacket ride-up.' },
      { title: 'Thumb Loop Sleeves', description: 'Keeps sleeves securely inside riding gloves.' },
    ],
    logistics: {
      shipping: 'Standard shipping available.',
      returns: '30-day return policy for unwashed, unused items with tags.',
    },
    variants: [
      { color: 'Grey', colorHex: '#6c757d', size: 'L', price: 0, stockQuantity: 10, sku: '8G-KEV-HD-GR', images: [] },
      { color: 'Black', colorHex: '#111111', size: 'L', price: 0, stockQuantity: 10, sku: '8G-KEV-HD-BK', images: [] },
    ],
  },
  {
    title: 'Raven Crew Neck with Kevlar®',
    slug: 'raven-crew-neck-with-kevlar',
    category: 'Crewneck',
    brand: '8 GEAR',
    baseDescription: 'Certified motorcycle protection combined with the comfort and versatility of an everyday crew sweatshirt.',
    fullDescription: 'Constructed from an 80% cotton / 20% polyester shell with Kevlar® panel reinforcement. Features modern slim fit profile, thumb loop cuffs to keep sleeves positioned inside gloves, water-resistant zippered storage pockets, CE Level 2 protectors (shoulders, elbows & back), Durable Water Repellent (DWR) finish, back reflector for low-light visibility, and integrated belt connection loops.',
    tags: ['crewneck', 'kevlar', 'sweatshirt', 'slim-fit', 'protection'],
    materialCare: {
      composition: '80% Cotton / 20% Polyester Shell with Kevlar® Panel Reinforcement',
      careInstructions: 'Machine wash cold. Remove armors before washing. Do not bleach.',
    },
    advantages: [
      { title: 'CE Class AA Certified', description: 'Certified under EN 17092-3:2020.' },
      { title: 'Back Reflector Detail', description: 'High-visibility back reflector for low-light and night riding.' },
      { title: 'Slim Fit Profile', description: 'Streamlined silhouette reduces bulk while maintaining mobility.' },
    ],
    logistics: {
      shipping: 'Standard shipping available.',
      returns: '30-day return policy for unwashed, unused items with tags.',
    },
    variants: [
      { color: 'Black', colorHex: '#111111', size: 'L', price: 0, stockQuantity: 10, sku: '8G-KEV-CW-BK', images: [] },
      { color: 'Grey', colorHex: '#6c757d', size: 'L', price: 0, stockQuantity: 10, sku: '8G-KEV-CW-GR', images: [] },
    ],
  },
  {
    title: 'Kevlar® Kids Hoodie',
    slug: 'kevlar-kids-hoodie',
    category: 'Hoodies',
    brand: '8 GEAR',
    baseDescription: 'Protective riding hoodie designed for young motorcycle passengers and youth riders needing dependable protection, comfort, and style.',
    fullDescription: 'Outer shell of 80% cotton / 20% polyester with Kevlar® panel reinforcement. Features soft interior feel, dual locked stitching in high-stress zones, streamlined hood without loose drawstrings for safety, CE Level 1 protectors (shoulders, elbows, back), water repellent finish, night reflective details, youth slim fit, integrated belt connection loops, thumb loops, and water-resistant zippered pockets.',
    tags: ['kids', 'youth', 'hoodie', 'kevlar', 'protection'],
    materialCare: {
      composition: '80% Cotton / 20% Polyester Shell with Kevlar® Reinforcement',
      careInstructions: 'Machine wash cold gentle cycle. Air dry.',
    },
    advantages: [
      { title: 'Child Safety Design', description: 'Streamlined hood without loose drawstrings to prevent snagging.' },
      { title: 'CE Level 1 Youth Armor', description: 'Protectors engineered for young riders (shoulders, elbows, back).' },
      { title: 'Night Reflective Details', description: 'Reflective elements for increased night visibility.' },
    ],
    logistics: {
      shipping: 'Standard shipping available.',
      returns: '30-day return policy for unwashed, unused items with tags.',
    },
    variants: [
      { color: 'Jet Black', colorHex: '#111111', size: 'M', price: 0, stockQuantity: 10, sku: '8G-KEV-KD-HD-JB', images: [] },
      { color: 'Grey', colorHex: '#6c757d', size: 'M', price: 0, stockQuantity: 10, sku: '8G-KEV-KD-HD-GR', images: [] },
    ],
  },
  {
    title: 'Welltron Jersey Hoodie — Single Layer',
    slug: 'welltron-jersey-hoodie-single-layer',
    category: 'Hoodies',
    brand: '8 GEAR',
    baseDescription: 'Lightweight single-layer technical riding sweater designed for comfort, mobility, and all-season riding with a slim, streamlined fit.',
    fullDescription: 'Cotton-polyester blend single-layer construction with AAA-rated protective strength directly integrated into the fabric. Features water-repellent finish, reflective back detailing, attachment loops for securing to riding bottoms, adjustable sleeve fasteners, and Level 2 armors.',
    tags: ['single-layer', 'jersey-hoodie', 'aaa-rated', 'water-repellent', 'technical-sweatshirt'],
    materialCare: {
      composition: 'Single Layer Cotton-Polyester Technical Blend',
      careInstructions: 'Machine wash cold. Do not tumble dry.',
    },
    advantages: [
      { title: 'CE Class AAA Rated', description: 'Highest protection certification tier for single-layer garments.' },
      { title: 'Single-Layer Technical Fabric', description: 'Protection built directly into fabric without inner liner.' },
      { title: 'Water-Repellent & Reflective', description: 'DWR finish with reflective back details.' },
    ],
    logistics: {
      shipping: 'Standard shipping available.',
      returns: '30-day return policy for unwashed, unused items with tags.',
    },
    variants: [
      { color: 'Black', colorHex: '#111111', size: 'L', price: 0, stockQuantity: 10, sku: '8G-SL-WJ-HD-BK', images: [] },
      { color: 'Grey', colorHex: '#6c757d', size: 'L', price: 0, stockQuantity: 10, sku: '8G-SL-WJ-HD-GR', images: [] },
    ],
  },
  {
    title: 'Torvan Cargo — Single Layer Technical Riding Cargo',
    slug: 'torvan-cargo-single-layer-technical-riding-cargo',
    category: "Cargo's",
    brand: '8 GEAR',
    baseDescription: 'Slim-fit single-layer cargo pants with Kevlar® integrated into the fabric weave for a clean, lightweight riding profile.',
    fullDescription: 'Engineered for protection without the bulk. Features Kevlar® integrated within single-layer fabric construction, secure utility pockets, adjustable Level 2 armor, water repellency, Velcro® ankle fasteners, hanging hooks, and connecting loops for riding functionality.',
    tags: ['single-layer', 'cargo', 'kevlar', 'torvan', 'lightweight'],
    materialCare: {
      composition: 'Single Layer Kevlar®-Integrated Technical Cotton Poly Fabric',
      careInstructions: 'Machine wash cold with like colors. Air dry.',
    },
    advantages: [
      { title: 'Single-Layer Kevlar® Weave', description: 'Protection integrated into main fabric for maximum airflow and minimum weight.' },
      { title: 'Level 2 Adjustable Armor', description: 'Adjustable knee and hip protectors.' },
      { title: 'Functional Details', description: 'Velcro® ankle fasteners, hanging hooks, and connecting loops.' },
    ],
    logistics: {
      shipping: 'Standard shipping available.',
      returns: '30-day return policy for unwashed, unused items with tags.',
    },
    variants: [
      { color: 'Grey', colorHex: '#6c757d', size: '32', price: 0, stockQuantity: 10, sku: '8G-SL-TR-CG-GR', images: [] },
      { color: 'Black', colorHex: '#111111', size: '32', price: 0, stockQuantity: 10, sku: '8G-SL-TR-CG-BK', images: [] },
    ],
  },
];

async function importProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    let insertedCount = 0;
    let updatedCount = 0;

    for (const prodData of productsData) {
      const existing = await Product.findOne({ slug: prodData.slug });
      if (existing) {
        await Product.findOneAndUpdate({ slug: prodData.slug }, prodData, { new: true });
        updatedCount++;
        console.log(`Updated product: ${prodData.title}`);
      } else {
        await Product.create(prodData);
        insertedCount++;
        console.log(`Inserted product: ${prodData.title}`);
      }
    }

    console.log(`\n🎉 CATALOGUE IMPORT COMPLETE!`);
    console.log(`Inserted: ${insertedCount}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Total Products in import batch: ${productsData.length}`);

    const totalInDb = await Product.countDocuments();
    console.log(`Total Products now in Database: ${totalInDb}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error importing catalogue products:', err);
    process.exit(1);
  }
}

importProducts();
