import { NextRequest, NextResponse } from 'next/server';
import { getProducts, setProducts, Product } from '../route';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const products = getProducts();
  const product = products.find(p => p.id === parseInt(id));
  
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  
  return NextResponse.json(product);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, price, brand, type, image_url } = body;
    
    const products = getProducts();
    const index = products.findIndex(p => p.id === parseInt(id));
    
    if (index === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    const updatedProduct: Product = {
      ...products[index],
      name,
      description: description || null,
      price: parseFloat(price),
      brand,
      type,
      image_url: image_url || null,
      updated_at: new Date().toISOString()
    };
    
    products[index] = updatedProduct;
    setProducts(products);
    
    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const products = getProducts();
    const index = products.findIndex(p => p.id === parseInt(id));
    
    if (index === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    products.splice(index, 1);
    setProducts(products);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
