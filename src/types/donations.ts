
export type DonationStatus = "pending" | "received" | "rejected";

export interface DonationUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
}

export interface DonationWithProfiles {
  id: number;
  item_name: string;
  description: string | null;
  category: string;
  quantity: string;
  location: string;
  status: DonationStatus;
  created_at: string;
  donor_id: string;
  receiver_id: string | null;
  donor: DonationUser | null;
  receiver: DonationUser | null;
  expiry_time: string | null;
}
