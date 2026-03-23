export type Category =
  | 'books'
  | 'electronics'
  | 'furniture'
  | 'kitchen'
  | 'clothes'
  | 'cycles'
  | 'sports'
  | 'other';

export type Condition = 'like_new' | 'good' | 'fair';
export type ListingStatus = 'active' | 'sold' | 'expired' | 'deleted';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  department: string | null;
  hostel_block: string | null;
  year_of_study: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface ListingImage {
  id: string;
  listing_id: string;
  url: string;
  storage_path: string;
  position: number;
}

export interface Listing {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  price: number;
  is_negotiable: boolean;
  category: Category;
  condition: Condition;
  status: ListingStatus;
  view_count: number;
  created_at: string;
  expires_at: string;
  profiles?: Profile;
  listing_images?: ListingImage[];
}

export interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: string;
  listings?: Listing;
  buyer?: Profile;
  seller?: Profile;
  messages?: Message[];
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  profiles?: Profile;
}

export interface Report {
  id: string;
  listing_id: string;
  reporter_id: string;
  reason: 'spam' | 'fake' | 'inappropriate' | 'already_sold' | 'other';
  description: string | null;
  status: 'pending' | 'reviewed' | 'dismissed';
  created_at: string;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  books: 'Books',
  electronics: 'Electronics',
  furniture: 'Furniture',
  kitchen: 'Kitchen',
  clothes: 'Clothes',
  cycles: 'Cycles',
  sports: 'Sports',
  other: 'Other',
};

export const CONDITION_LABELS: Record<Condition, string> = {
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
};
