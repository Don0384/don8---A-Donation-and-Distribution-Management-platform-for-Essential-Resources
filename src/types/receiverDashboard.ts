
export const categories = ["All", "food", "clothes", "furniture", "electronics", "books", "toys", "other"];
export const statuses = ["All", "pending", "received", "rejected"];

export const categoryDisplayNames: Record<string, string> = {
  food: "Food",
  clothes: "Clothes",
  furniture: "Furniture",
  electronics: "Electronics",
  books: "Books",
  toys: "Toys",
  other: "Other"
};

export interface DonationUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
}

export interface PickupRequest {
  user_id: string;
  donation_id: number;
  pickup_time: string;
  created_at: string;
}

export interface Donation {
  id: number;
  item_name: string;
  description: string | null;
  category: string;
  quantity: string;
  status: string;
  created_at: string;
  location: string;
  expiry_time: string | null;
  images: string[];
  donor_id: string;
  receiver_id: string | null;
  donor: DonationUser | null;
  acceptance_deadline: string | null;
  pickup_requests: PickupRequest[];
}
