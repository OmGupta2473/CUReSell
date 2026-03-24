# CUReSell Project Memory

## Summary
CUReSell / CampusResell is a Next.js 14 + Supabase campus marketplace MVP inspired by Carousell. It is built for Chandigarh University students to buy and sell second-hand items inside a verified college-only community using college email OTP login.

## Stack
- Next.js 14 App Router
- TypeScript strict mode
- Tailwind CSS
- Supabase Auth, Postgres, Storage, Realtime
- React Hook Form + Zod
- TanStack Query
- browser-image-compression
- Embla
- lucide-react

## Current Route Behavior
- `/` is public.
- Signed-out users see a Carousell-style landing page.
- Signed-in users see the real marketplace feed on `/`.
- `/login` and `/verify` are auth pages.
- `/listing/new`, `/listing/[id]`, `/messages`, `/messages/[conversationId]`, `/profile`, `/profile/[userId]` are protected by middleware unless explicitly public.
- Listing detail pages currently require login.

## Important Files
- Root layout: `app/layout.tsx`
- Middleware: `middleware.ts`
- Landing/feed page: `app/(main)/page.tsx`
- Login: `app/(auth)/login/page.tsx`
- OTP verify: `app/(auth)/verify/page.tsx`
- New listing page: `app/(main)/listing/new/page.tsx`
- Listing detail page: `app/(main)/listing/[id]/page.tsx`
- Messages inbox: `app/(main)/messages/page.tsx`
- Conversation page: `app/(main)/messages/[conversationId]/page.tsx`
- Own profile page: `app/(main)/profile/page.tsx`
- Public profile page: `app/(main)/profile/[userId]/page.tsx`

## Implemented Features
- OTP auth with Supabase using college email domain validation
- Public landing page inspired by Carousell
- Auth-aware navbar and bottom nav
- Signed-in marketplace feed with:
  - search bar
  - category pills
  - listing grid
  - empty state
  - floating mobile post button
- Listing creation flow with:
  - image uploader
  - client-side image compression
  - Supabase Storage uploads
  - listing insert + listing_images insert
- Listing detail page with:
  - image gallery
  - seller card
  - mark sold action
  - start chat action
  - share button
  - save UI placeholder
- Messages inbox using real `conversations` data
- Realtime chat thread with optimistic sending
- Own profile page with inline edit capability and sign out
- Public user profile page with listings

## Reusable Components
### Layout
- `components/layout/Navbar.tsx`
- `components/layout/BottomNav.tsx`
- `components/layout/QueryProvider.tsx`

### Listing
- `components/listing/ListingCard.tsx`
- `components/listing/ListingGrid.tsx`
- `components/listing/SearchBar.tsx`
- `components/listing/CategoryFilter.tsx`
- `components/listing/ImageUploader.tsx`
- `components/listing/ListingForm.tsx`
- `components/listing/ListingDetail.tsx`

### Chat
- `components/chat/InboxList.tsx`
- `components/chat/ChatThread.tsx`
- `components/chat/ChatInput.tsx`
- `components/chat/MessageBubble.tsx`

### Profile
- `components/profile/ProfileHeader.tsx`
- `components/profile/UserListings.tsx`

## Hooks and Utilities
- Auth hook: `lib/hooks/useAuth.ts`
- Listings hook: `lib/hooks/useListings.ts`
- Messages hook: `lib/hooks/useMessages.ts`
- Formatters: `lib/utils/formatters.ts`
- Image compression/upload: `lib/utils/imageCompression.ts`
- Listing validation schema: `lib/validations/listing.ts`

## Backend / Data Notes
- Existing Supabase logic is preserved.
- No custom backend server was introduced.
- Existing tables used:
  - `profiles`
  - `listings`
  - `listing_images`
  - `conversations`
  - `messages`
- Supabase Storage bucket for listing images is already wired.
- React Query is provided globally from the root layout.

## Middleware Notes
- `/` is explicitly public.
- `_next`, `favicon`, and `/api/auth` are treated as public assets/routes.
- Everything else still follows auth protection unless explicitly allowed.

## Config Notes
- `.env.local` already exists and was intentionally not modified.
- Supabase image domain is allowed in `next.config.js`.
- Tailwind scrollbar hide plugin is configured in `tailwind.config.ts`.
- `app/globals.css` includes `safe-bottom` and `pb-safe`.

## Known Gaps / Remaining Work
- `/search` route does not exist yet, but nav links to it.
- `/listing/[id]/edit` is still placeholder.
- Admin page is still placeholder.
- Report listing button is UI only.
- Save/favorite is UI only; no backend favorites table yet.
- No reviews backend.
- No infinite scrolling yet.
- No sort bar or location filter yet.
- No real social login.
- Signed-out users cannot browse real listings unless Supabase RLS is changed to allow public reads.

## Visual Direction
- Public landing page is Carousell-inspired:
  - search-led hero
  - discovery/category blocks
  - trust/value sections
- Signed-in surfaces are being migrated toward the same marketplace feel.
- Messages and profile are now real pages, not placeholders.

## Build Status
- `pnpm build` passes cleanly at the current state.

## Recommended Next Steps
1. Build `/search` page.
2. Implement edit listing flow.
3. Add richer feed sorting/location/filter controls.
4. Add favorites/report backend support if desired.
5. Finish admin dashboard.
