
import { DonationUser, PickupRequest } from './donations';

export interface DonorDonation {
  id: number;
  item_name: string;
  quantity: string;
  category: string;
  status: string;
  created_at: string;
  description: string | null;
  location: string;
  expiry_time: string | null;
  images: string[] | null;
  receiver_id: string | null;
  receiver?: DonationUser | null;
  pickup_requests?: PickupRequest[];
  timeRemaining?: string | null;
  acceptance_deadline?: string | null;
}
