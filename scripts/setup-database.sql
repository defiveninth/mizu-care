-- Drop existing tables to recreate with correct schema
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS scan_stats CASCADE;

-- Create reviews table (no authentication required)
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  author_name VARCHAR(100) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  skin_type VARCHAR(50),
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create scan_stats table to track real statistics
CREATE TABLE IF NOT EXISTS scan_stats (
  id INTEGER PRIMARY KEY DEFAULT 1,
  total_scans INTEGER DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  ratings_sum INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initialize scan_stats with starting values
INSERT INTO scan_stats (id, total_scans, total_ratings, ratings_sum) 
VALUES (1, 127, 98, 471)
ON CONFLICT (id) DO NOTHING;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);
