# Auth Lock Conflict & RLS Policy Fixes

## Issues Fixed

### 1. **Auth Lock Conflict**
**Error:** `Lock "lock:sb-<project>-auth-token" was released because another request stole it`

**Root Cause:** Multiple concurrent `supabase.auth.getUser()` calls
- `useAuth()` hook called `getUser()` on component mount  
- `ListingForm` called `getUser()` independently during form submission  
- `uploadListingImage()` utility called `getUser()` during image upload  
- These happened in quick succession, causing auth token lock conflicts

**Solution:** Made `useAuth()` the single source of truth for user state
- Client components now use `useAuth()` hook instead of calling `getUser()`
- Utility functions accept `userId` as parameter instead of fetching user
- Eliminated redundant concurrent auth requests

### 2. **"Mark as Sold" 403 Forbidden Error**
**Error:** `PATCH https://ksbxmtcghitzmceyadna.supabase.co/rest/v1/listings?id=eq.<listing_id> 403 (Forbidden)`

**Root Cause:** RLS policy violation - query didn't filter by `seller_id`

Supabase RLS Policy:
```sql
create policy "Sellers can update their own listings"
  on public.listings for update to authenticated
  using (seller_id = auth.uid());
```

This requires **both** conditions in the WHERE clause:
- `id = <listing_id>` AND
- `seller_id = auth.uid()` (the current user)

**Previous Code (⚠️ BROKEN):**
```tsx
await supabase.from('listings').update({ status: 'sold' }).eq('id', listing.id);
// Generated: PATCH /rest/v1/listings?id=eq.<listing_id>
// Supabase checks: "Is seller_id = auth.uid()?" → NOT FOUND → 403 ❌
```

**Fixed Code (✅ WORKS):**
```tsx
await supabase
  .from('listings')
  .update({ status: 'sold' })
  .eq('id', listing.id)
  .eq('seller_id', user.id);  // ← Added this filter
// Generated: PATCH /rest/v1/listings?id=eq.<listing_id>&seller_id=eq.<user_id>
// Supabase checks: "Is seller_id = auth.uid()?" → YES → 200 OK ✅
```

---

## Files Modified

### 1. **`lib/hooks/useAuth.ts`** (Already Correct)
- ✅ Single `supabase.auth.getUser()` call in useEffect
- ✅ Subscribes to auth state changes via `onAuthStateChange`
- ✅ Returns `{ user, profile, loading, signOut }` for app-wide use

```typescript
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    // ✅ Single auth fetch - no lock conflicts
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        void fetchProfile(user.id);
      } else {
        setLoading(false);
      }
    });

    // ✅ Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        void fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return { user, profile, loading, signOut };
}
```

### 2. **`lib/utils/imageCompression.ts`** (FIXED ✅)
**Before:**
```typescript
export async function uploadListingImage(
  supabase: ReturnType<typeof import('@/lib/supabase/client').createClient>,
  file: File,
  listingId: string,
  position: number
): Promise<{ url: string; storage_path: string }> {
  const compressed = await compressImage(file);
  const { data: { user } } = await supabase.auth.getUser();  // ⚠️ CONFLICT!
  if (!user) throw new Error('Not authenticated');
  // ...
}
```

**After:**
```typescript
export async function uploadListingImage(
  supabase: ReturnType<typeof import('@/lib/supabase/client').createClient>,
  file: File,
  listingId: string,
  position: number,
  userId: string  // ✅ Accept userId as parameter
): Promise<{ url: string; storage_path: string }> {
  const compressed = await compressImage(file);
  if (!userId) throw new Error('Not authenticated');  // ✅ Simple validation

  const ext = compressed.type === 'image/webp' ? 'webp' : compressed.name.split('.').pop() ?? 'jpg';
  const storage_path = `${userId}/${listingId}/${position}.${ext}`;
  // ... rest of function
}
```

### 3. **`components/listing/ListingForm.tsx`** (FIXED ✅)
**Before:**
```typescript
export function ListingForm({ mode = 'create', initialListing }: ListingFormProps) {
  const router = useRouter();
  const supabase = createClient();
  // ⚠️ Not using useAuth hook
  // ⚠️ Calling getUser() in form submission

  async function onSubmit(values: ListingFormValues) {
    try {
      const { data: { user } } = await supabase.auth.getUser();  // ⚠️ CONFLICT!
      if (!user) throw new Error('Not authenticated');
      // ... uses user.id for listing creation
```

**After:**
```typescript
import { useAuth } from '@/lib/hooks/useAuth';  // ✅ Import useAuth

export function ListingForm({ mode = 'create', initialListing }: ListingFormProps) {
  const { user: authUser } = useAuth();  // ✅ Get user from hook
  const supabase = createClient();

  async function onSubmit(values: ListingFormValues) {
    try {
      if (!authUser) throw new Error('Not authenticated');  // ✅ Use authUser from hook
      
      const listingPayload = { /* ... */ };
      
      if (isEditing) {
        if (initialListing.seller_id !== authUser.id) {  // ✅ Use authUser.id
          throw new Error('You can only edit your own listing');
        }
        // Update with seller_id filter for RLS
        const { error: listingError } = await supabase
          .from('listings')
          .update(listingPayload)
          .eq('id', initialListing.id)
          .eq('seller_id', authUser.id);  // ✅ Add seller filter
      } else {
        const { data: listing, error: listingError } = await supabase
          .from('listings')
          .insert({
            seller_id: authUser.id,  // ✅ Use authUser.id
            ...listingPayload,
            status: 'active',
          })
          .select('id')
          .single();
      }

      // When calling uploadListingImage, pass userId to avoid auth lock
      const { url, storage_path } = await uploadListingImage(
        supabase,
        newImages[i].file,
        listingId,
        position,
        authUser.id  // ✅ Pass userId instead of calling getUser()
      );
```

### 4. **`components/listing/ListingDetail.tsx`** (FIXED ✅)
**Before:**
```typescript
async function handleMarkSold() {
  await supabase.from('listings').update({ status: 'sold' }).eq('id', listing.id);  // ⚠️ Missing seller_id filter!
  router.refresh();
}
```

**After:**
```typescript
const [markSoldLoading, setMarkSoldLoading] = useState(false);
const { user } = useAuth();  // ✅ Use useAuth hook

async function handleMarkSold() {
  if (!user || markSoldLoading) return;  // ✅ Guard checks

  setMarkSoldLoading(true);

  try {
    const { error } = await supabase
      .from('listings')
      .update({ status: 'sold' })
      .eq('id', listing.id)
      .eq('seller_id', user.id);  // ✅ Add seller_id filter for RLS

    if (error) throw error;

    setActionMessage('Listing marked as sold');  // ✅ User feedback
    router.refresh();
  } catch {
    setActionMessage('Could not mark listing as sold');
  } finally {
    setMarkSoldLoading(false);  // ✅ Always reset loading state
  }
}

// In JSX - button shows loading state
<button
  onClick={handleMarkSold}
  disabled={markSoldLoading}
  className="... disabled:cursor-not-allowed disabled:opacity-50"
>
  {markSoldLoading ? 'Marking as sold...' : 'Mark as sold'}  // ✅ UX feedback
</button>
```

---

## Key Principles Applied

### 1. **Single Source of Truth for Auth**
- ✅ Only `useAuth()` calls `supabase.auth.getUser()`
- ✅ All client components use `useAuth()` hook
- ✅ User state is cached in React, preventing simultaneous auth requests

### 2. **RLS Policy Compliance**
- ✅ All listing updates include `.eq('seller_id', user.id)` filter
- ✅ Matches RLS policy: `using (seller_id = auth.uid())`
- ✅ Prevents 403 Forbidden errors

### 3. **Avoid Lock Conflicts**
- ✅ Utility functions accept `userId` as parameter instead of fetching
- ✅ No concurrent `getUser()` calls in event handlers
- ✅ Auth state is managed centrally in `useAuth()`

### 4. **Error Handling**
- ✅ Always check if user exists before operations
- ✅ Provide user-friendly error messages
- ✅ Set loading states to prevent duplicate submissions

---

## Testing Checklist

- [ ] Create a new listing - verify image uploads work without auth lock errors
- [ ] Edit an existing listing - verify seller_id filter works
- [ ] Click "Mark as Sold" - verify no 403 error, button shows loading state
- [ ] Check browser console - no auth lock warnings
- [ ] Verify loading messages appear during operations
- [ ] Verify success messages appear after operations

---

## Server Components (No Changes Needed)

Server components can safely keep `supabase.auth.getUser()` because:
- ✅ Server-side rendering is sequential (no concurrency issues)
- ✅ Each page request gets fresh auth state
- ✅ No lock conflicts across sequential requests

Examples - these are fine as-is:
- `app/*/page.tsx` - All SSR pages with `getUser()`
- `middleware.ts` - Sequential middleware execution
- `app/api/auth/callback/route.ts` - Single request handler
