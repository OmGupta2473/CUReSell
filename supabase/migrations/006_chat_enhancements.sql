-- ============================================================
-- Migration: Chat Enhancements (Typing Indicator + Read Receipts)
-- ============================================================

-- 1. Add read_at timestamp to messages
alter table public.messages
  add column if not exists read_at timestamptz;

-- 2. Allow conversation participants to update messages (mark as read)
create policy "Conversation participants can update messages"
  on public.messages for update to authenticated
  using (
    conversation_id in (
      select id from public.conversations
      where buyer_id = auth.uid() or seller_id = auth.uid()
    )
  )
  with check (
    conversation_id in (
      select id from public.conversations
      where buyer_id = auth.uid() or seller_id = auth.uid()
    )
  );

-- 3. Create typing_status table
create table if not exists public.typing_status (
  user_id uuid references public.profiles(id) on delete cascade not null,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  is_typing boolean default false,
  updated_at timestamptz default now(),
  primary key (user_id, conversation_id)
);

-- 4. Enable RLS on typing_status
alter table public.typing_status enable row level security;

-- Participants can view typing status in their conversations
create policy "Participants can view typing status"
  on public.typing_status for select to authenticated
  using (
    conversation_id in (
      select id from public.conversations
      where buyer_id = auth.uid() or seller_id = auth.uid()
    )
  );

-- Users can upsert their own typing status
create policy "Users can upsert own typing status"
  on public.typing_status for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own typing status"
  on public.typing_status for update to authenticated
  using (user_id = auth.uid());

-- 5. Enable Supabase Realtime for typing_status and messages
alter publication supabase_realtime add table public.typing_status;
-- messages may already be in the publication; ignore error if so
-- alter publication supabase_realtime add table public.messages;
