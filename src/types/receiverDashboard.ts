
import { DonationUser } from './donations';

export const categoryDisplayNames: Record<string, string> = {
  "food": "Food",
  "clothes": "Clothing",
  "furniture": "Furniture",
  "electronics": "Electronics",
  "books": "Books",
  "toys": "Toys",
  "other": "Other"
};

export interface Donation {
  id: number;
  item_name: string;
  description: string | null;
  category: string;
  quantity: string;
  location: string;
  status: string;
  created_at: string;
  donor_id: string;
  receiver_id: string | null;
  expiry_time: string | null;
  images: string[] | null;
  pickup_requests?: Array<{
    user_id: string;
    pickup_time: string;
    created_at: string;
    donation_id?: number;
  }>;
  acceptance_deadline?: string | null;
  donor?: DonationUser | null;
}
