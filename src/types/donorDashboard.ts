
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
  timeRemaining?: string | null;
}
