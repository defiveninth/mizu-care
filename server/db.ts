import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'products.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('journal_mode = WAL');

// Create products table
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    brand TEXT NOT NULL,
    type TEXT NOT NULL,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create index for faster filtering
db.exec(`CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_products_type ON products(type)`);

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

export type NewProduct = Omit<Product, 'id' | 'created_at' | 'updated_at'>;

// Product queries
export const productQueries = {
  getAll: db.prepare('SELECT * FROM products ORDER BY created_at DESC'),
  
  getById: db.prepare('SELECT * FROM products WHERE id = ?'),
  
  getBrands: db.prepare('SELECT DISTINCT brand FROM products ORDER BY brand'),
  
  getTypes: db.prepare('SELECT DISTINCT type FROM products ORDER BY type'),
  
  create: db.prepare(`
    INSERT INTO products (name, description, price, brand, type, image_url)
    VALUES (@name, @description, @price, @brand, @type, @image_url)
  `),
  
  update: db.prepare(`
    UPDATE products 
    SET name = @name, description = @description, price = @price, 
        brand = @brand, type = @type, image_url = @image_url, updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `),
  
  delete: db.prepare('DELETE FROM products WHERE id = ?'),
  
  search: (query: string, brand?: string, type?: string) => {
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params: (string | number)[] = [];
    
    if (query) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${query}%`, `%${query}%`);
    }
    
    if (brand) {
      sql += ' AND brand = ?';
      params.push(brand);
    }
    
    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    return db.prepare(sql).all(...params);
  }
};

export default db;
