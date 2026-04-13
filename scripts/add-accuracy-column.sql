-- Add accuracy_rate column to scan_stats
ALTER TABLE scan_stats ADD COLUMN IF NOT EXISTS accuracy_rate INTEGER DEFAULT 98;

-- Update the existing row with the default value
UPDATE scan_stats SET accuracy_rate = 98 WHERE id = 1;
