-- Add reply column to comments table
alter table public.comments 
add column if not exists reply text;

-- Policy to allow anyone to read replies (already covered by public select, but good to verify)
-- No new policy needed for select as 'true' covers all columns unless restricted.
