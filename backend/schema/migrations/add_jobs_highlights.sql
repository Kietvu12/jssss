-- Add highlights column to jobs (Điểm nổi bật - manual text, multi-line)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS highlights TEXT NULL;
