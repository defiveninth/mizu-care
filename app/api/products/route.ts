import { NextRequest, NextResponse } from 'next/server';

// In-memory store for products (since SQLite with better-sqlite3 doesn't work in serverless)
let products: Product[] = [
  {
    id: 1,
    name: "Hydrating Facial Mist",
    description: "A refreshing mist that provides instant hydration and a dewy glow. Perfect for all skin types.",
    price: 28.99,
    brand: "MizuCaire",
    type: "Spray",
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: "Vitamin C Brightening Serum",
    description: "Powerful antioxidant serum that brightens skin and reduces dark spots.",
    price: 45.00,
    brand: "GlowLab",
    type: "Serum",
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: "Deep Moisture Cream",
    description: "Rich, nourishing cream for dry and sensitive skin. Locks in moisture for 24 hours.",
    price: 52.00,
    brand: "MizuCaire",
    type: "Cream",
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    name: "Gentle Foaming Cleanser",
    description: "Sulfate-free cleanser that removes impurities without stripping natural oils.",
    price: 24.00,
    brand: "PureSkin",
    type: "Cleanser",
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    name: "Retinol Night Treatment",
    description: "Anti-aging treatment that reduces fine lines and improves skin texture overnight.",
    price: 68.00,
    brand: "GlowLab",
    type: "Serum",
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 6,
    name: "Sunscreen SPF 50",
    description: "Lightweight, non-greasy sunscreen with broad spectrum protection.",
    price: 32.00,
    brand: "PureSkin",
    type: "Sunscreen",
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 7,
    name: "Calming Face Mist",
    description: "Soothing spray with aloe and chamomile for irritated skin.",
    price: 22.00,
    brand: "MizuCaire",
    type: "Spray",
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 8,
    name: "Exfoliating Toner",
    description: "AHA/BHA toner that gently exfoliates and refines pores.",
    price: 38.00,
    brand: "GlowLab",
    type: "Toner",
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let nextId = 9;

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  brand: string;
  type: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

// Make products accessible to other routes
export function getProducts() {
  return products;
}

export function setProducts(newProducts: Product[]) {
  products = newProducts;
}

export function getNextId() {
  return nextId++;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const brand = searchParams.get('brand') || '';
  const type = searchParams.get('type') || '';

  let filtered = [...products];

  if (search) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(search) || 
      (p.description?.toLowerCase().includes(search))
    );
  }

  if (brand) {
    filtered = filtered.filter(p => p.brand === brand);
  }

  if (type) {
    filtered = filtered.filter(p => p.type === type);
  }

  return NextResponse.json(filtered);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, brand, type, image_url } = body;

    if (!name || !price || !brand || !type) {
      return NextResponse.json(
        { error: 'Name, price, brand, and type are required' },
        { status: 400 }
      );
    }

    const newProduct: Product = {
      id: nextId++,
      name,
      description: description || null,
      price: parseFloat(price),
      brand,
      type,
      image_url: image_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    products.push(newProduct);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
