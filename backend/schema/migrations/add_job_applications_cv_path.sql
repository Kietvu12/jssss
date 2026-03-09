-- Add cv_path column to job_applications to store selected CV folder path
-- cv_path will store folder path, e.g.:
-- - cvs/{cvId}/{dateTime}/CV_original
-- - cvs/{cvId}/{dateTime}/CV_Template/{Common|IT|Technical}
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS cv_path VARCHAR(1024) NULL AFTER cv_code;

