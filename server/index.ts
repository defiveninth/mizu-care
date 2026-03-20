import express from 'express';
import cors from 'cors';
import { productQueries, NewProduct, Product } from './db';

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(cors());
app.use(express.json());

// Get all products with optional filtering
app.get('/api/products', (req, res) => {
  try {
    const { search, brand, type } = req.query;
    
    if (search || brand || type) {
      const products = productQueries.search(
        search as string || '',
        brand as string,
        type as string
      );
      return res.json(products);
    }
    
    const products = productQueries.getAll.all();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get unique brands
app.get('/api/products/brands', (req, res) => {
  try {
    const brands = productQueries.getBrands.all() as { brand: string }[];
    res.json(brands.map(b => b.brand));
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// Get unique types
app.get('/api/products/types', (req, res) => {
  try {
    const types = productQueries.getTypes.all() as { type: string }[];
    res.json(types.map(t => t.type));
  } catch (error) {
    console.error('Error fetching types:', error);
    res.status(500).json({ error: 'Failed to fetch types' });
  }
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  try {
    const product = productQueries.getById.get(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product
app.post('/api/products', (req, res) => {
  try {
    const { name, description, price, brand, type, image_url } = req.body as NewProduct;
    
    if (!name || !price || !brand || !type) {
      return res.status(400).json({ error: 'Name, price, brand, and type are required' });
    }
    
    const result = productQueries.create.run({
      name,
      description: description || null,
      price,
      brand,
      type,
      image_url: image_url || null
    });
    
    const newProduct = productQueries.getById.get(result.lastInsertRowid);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
app.put('/api/products/:id', (req, res) => {
  try {
    const { name, description, price, brand, type, image_url } = req.body as NewProduct;
    const id = parseInt(req.params.id);
    
    const existing = productQueries.getById.get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    productQueries.update.run({
      id,
      name,
      description: description || null,
      price,
      brand,
      type,
      image_url: image_url || null
    });
    
    const updated = productQueries.getById.get(id);
    res.json(updated);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const existing = productQueries.getById.get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    productQueries.delete.run(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
