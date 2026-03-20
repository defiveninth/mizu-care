import { NextResponse } from 'next/server';
import { getProducts } from '../route';

export async function GET() {
  const products = getProducts();
  const brands = [...new Set(products.map(p => p.brand))].sort();
  return NextResponse.json(brands);
}
