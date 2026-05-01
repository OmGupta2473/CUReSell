-- Add auth_provider column to track login method
alter table public.profiles
add column auth_provider varchar(50) default null;

-- Add cu_email column with unique constraint for 1-to-1 Gmail to CU email mapping
alter table public.profiles
add column cu_email varchar(255) unique null;

-- Create index for faster lookups
create index idx_profiles_cu_email on public.profiles(cu_email);
create index idx_profiles_auth_provider on public.profiles(auth_provider);

-- Migration complete
-- This allows each Gmail account to link to only one CU email
-- And each CU email can only be linked to one Gmail account
