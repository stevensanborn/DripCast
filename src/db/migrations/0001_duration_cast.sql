ALTER TABLE videos
ALTER COLUMN duration TYPE integer
USING duration::integer; 