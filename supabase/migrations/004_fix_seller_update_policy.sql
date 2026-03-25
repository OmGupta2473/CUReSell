-- Fix: Add WITH CHECK clause to seller update policy
DROP POLICY IF EXISTS "Sellers can update their own listings" ON public.listings;

CREATE POLICY "Sellers can update their own listings"
  ON public.listings FOR UPDATE TO authenticated
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());
