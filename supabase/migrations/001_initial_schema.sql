-- Enable UUID extension
create extension if not exists "uuid-ossp";

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null unique,
  full_name text not null,
  avatar_url text,
  department text,
  hostel_block text,
  year_of_study text,
  is_admin boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.listings (
  id uuid default uuid_generate_v4() primary key,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  title text not null check (char_length(title) between 3 and 80),
  description text check (char_length(description) <= 500),
  price integer not null check (price >= 0),
  is_negotiable boolean default false,
  category text not null check (
    category in ('books', 'electronics', 'furniture', 'kitchen', 'clothes', 'cycles', 'sports', 'other')
  ),
  condition text not null check (
    condition in ('like_new', 'good', 'fair')
  ),
  status text not null default 'active' check (
    status in ('active', 'sold', 'expired', 'deleted')
  ),
  view_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '60 days')
);

create table public.listing_images (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  url text not null,
  storage_path text not null,
  position integer not null default 1 check (position between 1 and 4),
  created_at timestamptz default now()
);

create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  last_message_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(listing_id, buyer_id)
);

create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null check (char_length(content) between 1 and 1000),
  is_read boolean default false,
  created_at timestamptz default now()
);

create table public.reports (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  reporter_id uuid references public.profiles(id) on delete cascade not null,
  reason text not null check (
    reason in ('spam', 'fake', 'inappropriate', 'already_sold', 'other')
  ),
  description text,
  status text default 'pending' check (status in ('pending', 'reviewed', 'dismissed')),
  created_at timestamptz default now(),
  unique(listing_id, reporter_id)
);

create index listings_status_created on public.listings(status, created_at desc);
create index listings_category on public.listings(category) where status = 'active';
create index listings_seller on public.listings(seller_id);
create index listing_images_listing on public.listing_images(listing_id, position);
create index messages_conversation on public.messages(conversation_id, created_at asc);
create index conversations_buyer on public.conversations(buyer_id, last_message_at desc);
create index conversations_seller on public.conversations(seller_id, last_message_at desc);

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.reports enable row level security;

create policy "Profiles are viewable by authenticated users"
  on public.profiles for select to authenticated using (true);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

create policy "Active listings are viewable by authenticated users"
  on public.listings for select to authenticated
  using (status in ('active', 'sold') or seller_id = auth.uid());

create policy "Users can create listings"
  on public.listings for insert to authenticated
  with check (seller_id = auth.uid());

create policy "Sellers can update their own listings"
  on public.listings for update to authenticated
  using (seller_id = auth.uid());

create policy "Listing images viewable by authenticated users"
  on public.listing_images for select to authenticated using (true);

create policy "Sellers can manage their listing images"
  on public.listing_images for all to authenticated
  using (
    listing_id in (
      select id from public.listings where seller_id = auth.uid()
    )
  );

create policy "Users can view their own conversations"
  on public.conversations for select to authenticated
  using (buyer_id = auth.uid() or seller_id = auth.uid());

create policy "Buyers can create conversations"
  on public.conversations for insert to authenticated
  with check (buyer_id = auth.uid());

create policy "Conversation participants can view messages"
  on public.messages for select to authenticated
  using (
    conversation_id in (
      select id from public.conversations
      where buyer_id = auth.uid() or seller_id = auth.uid()
    )
  );

create policy "Conversation participants can send messages"
  on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid() and
    conversation_id in (
      select id from public.conversations
      where buyer_id = auth.uid() or seller_id = auth.uid()
    )
  );

create policy "Users can create reports"
  on public.reports for insert to authenticated
  with check (reporter_id = auth.uid());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.update_conversation_timestamp()
returns trigger language plpgsql
as $$
begin
  update public.conversations
  set last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger on_message_sent
  after insert on public.messages
  for each row execute procedure public.update_conversation_timestamp();

create or replace function public.expire_old_listings()
returns void language plpgsql
as $$
begin
  update public.listings
  set status = 'expired'
  where status = 'active' and expires_at < now();
end;
$$;

insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true);

create policy "Authenticated users can upload listing images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-images');

create policy "Anyone can view listing images"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "Users can delete their own uploads"
  on storage.objects for delete to authenticated
  using (bucket_id = 'listing-images' and auth.uid()::text = (storage.foldername(name))[1]);
