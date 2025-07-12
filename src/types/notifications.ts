export type NotificationType = 
  | 'pickup_request'
  | 'recipient_selected'
  | 'donation_accepted'
  | 'donation_rejected'
  | 'message_received';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface PickupRequestWithProfile {
  id: string;
  user_id: string;
  donation_id: number;
  pickup_time: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  profile?: {
    first_name?: string;
    last_name?: string;
  };
}