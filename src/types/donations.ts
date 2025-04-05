
export type DonationStatus = "pending" | "received" | "rejected";

export interface DonationUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
}

export interface PickupRequest {
  id?: string;
  user_id: string;
  donation_id: number;
  pickup_time: string;
  created_at: string;
}

export interface Report {
  id: number;
  reported_user_id: string;
  reporter_user_id: string;
  reason: string;
  status: string;
  created_at: string;
  reported_user?: {
    id: string;
    username?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    avatar_url?: string | null;
    updated_at?: string | null;
  } | null;
  reporter_user?: {
    id: string;
    username?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    avatar_url?: string | null;
    updated_at?: string | null;
  } | null;
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
  images: string[] | null;
  pickup_requests?: PickupRequest[];
  acceptance_deadline?: string | null;
}
