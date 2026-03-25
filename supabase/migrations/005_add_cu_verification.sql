-- Add CU student verification column
alter table public.profiles
add column is_cu_verified boolean default false;

-- Ensure existing Google OAuth users have a chance to verify
-- These will remain false until they complete email verification
