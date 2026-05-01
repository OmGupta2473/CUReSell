-- Phase 1: Auth & Security Stabilization
-- Harden RLS policies without introducing Phase 2 schema changes.

-- Profiles: authenticated users may read profiles; users may only mutate their own row.
drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;

create policy "Authenticated users can view profiles"
  on public.profiles for select to authenticated
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Listings: public visitors can browse active/sold listings, but only sellers/admins can mutate.
drop policy if exists "Active listings are viewable by authenticated users" on public.listings;
drop policy if exists "Users can create listings" on public.listings;
drop policy if exists "Sellers can update their own listings" on public.listings;
drop policy if exists "Admins can update any listing" on public.listings;

create policy "Public can view active and sold listings"
  on public.listings for select
  using (status in ('active', 'sold'));

create policy "Sellers can view their own listings"
  on public.listings for select to authenticated
  using (seller_id = auth.uid());

create policy "Users can create their own listings"
  on public.listings for insert to authenticated
  with check (seller_id = auth.uid());

create policy "Sellers can update their own listings"
  on public.listings for update to authenticated
  using (seller_id = auth.uid())
  with check (seller_id = auth.uid());

create policy "Admins can update any listing"
  on public.listings for update to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.is_admin = true
    )
  );

-- Listing images: public can read images for public listings; sellers can manage their own listing images.
drop policy if exists "Listing images viewable by authenticated users" on public.listing_images;
drop policy if exists "Sellers can manage their listing images" on public.listing_images;

create policy "Public can view images for public listings"
  on public.listing_images for select
  using (
    exists (
      select 1 from public.listings
      where listings.id = listing_images.listing_id
        and listings.status in ('active', 'sold')
    )
  );

create policy "Sellers can view their own listing images"
  on public.listing_images for select to authenticated
  using (
    exists (
      select 1 from public.listings
      where listings.id = listing_images.listing_id
        and listings.seller_id = auth.uid()
    )
  );

create policy "Sellers can insert their own listing images"
  on public.listing_images for insert to authenticated
  with check (
    exists (
      select 1 from public.listings
      where listings.id = listing_images.listing_id
        and listings.seller_id = auth.uid()
    )
  );

create policy "Sellers can update their own listing images"
  on public.listing_images for update to authenticated
  using (
    exists (
      select 1 from public.listings
      where listings.id = listing_images.listing_id
        and listings.seller_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.listings
      where listings.id = listing_images.listing_id
        and listings.seller_id = auth.uid()
    )
  );

create policy "Sellers can delete their own listing images"
  on public.listing_images for delete to authenticated
  using (
    exists (
      select 1 from public.listings
      where listings.id = listing_images.listing_id
        and listings.seller_id = auth.uid()
    )
  );

-- Conversations: buyer must be the current user, seller must match the listing, and users cannot chat with themselves.
drop policy if exists "Buyers can create conversations" on public.conversations;

create policy "Buyers can create conversations for listing sellers"
  on public.conversations for insert to authenticated
  with check (
    buyer_id = auth.uid()
    and buyer_id <> seller_id
    and exists (
      select 1 from public.listings
      where listings.id = conversations.listing_id
        and listings.seller_id = conversations.seller_id
        and listings.status = 'active'
    )
  );

-- Messages: participants can send, but read-receipt updates should only affect recipient-owned fields.
drop policy if exists "Conversation participants can update messages" on public.messages;

create policy "Recipients can mark messages as read"
  on public.messages for update to authenticated
  using (
    sender_id <> auth.uid()
    and conversation_id in (
      select id from public.conversations
      where buyer_id = auth.uid() or seller_id = auth.uid()
    )
  )
  with check (
    sender_id <> auth.uid()
    and conversation_id in (
      select id from public.conversations
      where buyer_id = auth.uid() or seller_id = auth.uid()
    )
  );

-- Reports: users can report public listings once, but cannot report their own listing.
drop policy if exists "Users can create reports" on public.reports;

create policy "Users can report active listings they do not own"
  on public.reports for insert to authenticated
  with check (
    reporter_id = auth.uid()
    and exists (
      select 1 from public.listings
      where listings.id = reports.listing_id
        and listings.status = 'active'
        and listings.seller_id <> auth.uid()
    )
  );

-- Favorites: users can favorite public listings they do not own.
drop policy if exists "Users can create their own favorites" on public.listing_favorites;

create policy "Users can favorite active listings they do not own"
  on public.listing_favorites for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.listings
      where listings.id = listing_favorites.listing_id
        and listings.status = 'active'
        and listings.seller_id <> auth.uid()
    )
  );

-- Typing status: participants may only create/update their own status inside conversations they belong to.
drop policy if exists "Users can upsert own typing status" on public.typing_status;
drop policy if exists "Users can update own typing status" on public.typing_status;

create policy "Users can insert own typing status in conversations"
  on public.typing_status for insert to authenticated
  with check (
    user_id = auth.uid()
    and conversation_id in (
      select id from public.conversations
      where buyer_id = auth.uid() or seller_id = auth.uid()
    )
  );

create policy "Users can update own typing status in conversations"
  on public.typing_status for update to authenticated
  using (
    user_id = auth.uid()
    and conversation_id in (
      select id from public.conversations
      where buyer_id = auth.uid() or seller_id = auth.uid()
    )
  )
  with check (
    user_id = auth.uid()
    and conversation_id in (
      select id from public.conversations
      where buyer_id = auth.uid() or seller_id = auth.uid()
    )
  );
