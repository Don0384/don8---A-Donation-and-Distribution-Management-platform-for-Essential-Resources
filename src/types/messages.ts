
export interface Message {
  id: number;
  user_id: string;
  content: string;
  created_at: string;
  user_type: 'donor' | 'receiver';
  is_read?: boolean;
  sender_name?: string;
}

export interface UnreadMessageCount {
  count: number;
}
