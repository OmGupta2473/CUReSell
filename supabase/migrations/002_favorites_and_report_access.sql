create table public.listing_favorites (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(listing_id, user_id)
);

create index listing_favorites_user_created
  on public.listing_favorites(user_id, created_at desc);

create index listing_favorites_listing
  on public.listing_favorites(listing_id);

alter table public.listing_favorites enable row level security;

create policy "Users can view their own favorites"
  on public.listing_favorites for select to authenticated
  using (user_id = auth.uid());

create policy "Users can create their own favorites"
  on public.listing_favorites for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users can delete their own favorites"
  on public.listing_favorites for delete to authenticated
  using (user_id = auth.uid());

create policy "Users can view their own reports"
  on public.reports for select to authenticated
  using (reporter_id = auth.uid());
