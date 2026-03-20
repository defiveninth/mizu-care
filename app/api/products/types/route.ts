import { NextResponse } from 'next/server';
import { getProducts } from '../route';

export async function GET() {
  const products = getProducts();
  const types = [...new Set(products.map(p => p.type))].sort();
  return NextResponse.json(types);
}
