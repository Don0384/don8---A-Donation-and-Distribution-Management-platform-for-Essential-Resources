
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

// Categories array for dropdown
export const categories = [
  { value: "All", label: "All Categories" },
  { value: "food", label: "Food" },
  { value: "clothes", label: "Clothing" },
  { value: "furniture", label: "Furniture" },
  { value: "electronics", label: "Electronics" },
  { value: "books", label: "Books" },
  { value: "toys", label: "Toys" },
  { value: "other", label: "Other" }
];

// Statuses array for filtering
export const statuses = [
  { value: "All", label: "All Statuses" },
  { value: "pending", label: "Available" },
  { value: "received", label: "Received" },
  { value: "rejected", label: "Rejected" }
];

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
