-- Fix RLS Policy for site_content table
-- This allows inserts and updates to work from the frontend

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Anyone can update content" ON public.site_content;
DROP POLICY IF EXISTS "Anyone can insert content" ON public.site_content;

-- Create permissive INSERT policy
CREATE POLICY "Anyone can insert content" ON public.site_content
  FOR INSERT WITH CHECK (true);

-- Create permissive UPDATE policy  
CREATE POLICY "Anyone can update content" ON public.site_content
  FOR UPDATE USING (true);

-- Also allow DELETE if needed for cleanup
CREATE POLICY "Anyone can delete content" ON public.site_content
  FOR DELETE USING (true);
