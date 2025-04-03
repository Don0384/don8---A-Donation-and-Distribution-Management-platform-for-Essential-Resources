
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Notification {
  type: "donation" | "message";
  id: number;
  isRead: boolean;
  createdAt: string;
  data: any;
}

export const useNotifications = (userType: "donor" | "receiver") => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [unreadDonationCount, setUnreadDonationCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [lastSeenDonation, setLastSeenDonation] = useState<string | null>(null);
  const [lastSeenMessage, setLastSeenMessage] = useState<string | null>(null);

  // Initialize last seen timestamps from localStorage
  useEffect(() => {
    if (!user) return;
    
    const storedLastSeenDonation = localStorage.getItem(`lastSeenDonation_${user.id}`);
    const storedLastSeenMessage = localStorage.getItem(`lastSeenMessage_${user.id}`);
    
    if (storedLastSeenDonation) setLastSeenDonation(storedLastSeenDonation);
    if (storedLastSeenMessage) setLastSeenMessage(storedLastSeenMessage);
  }, [user]);
  
  // Update localStorage when timestamps change
  useEffect(() => {
    if (!user) return;
    
    if (lastSeenDonation) {
      localStorage.setItem(`lastSeenDonation_${user.id}`, lastSeenDonation);
    }
    
    if (lastSeenMessage) {
      localStorage.setItem(`lastSeenMessage_${user.id}`, lastSeenMessage);
    }
  }, [lastSeenDonation, lastSeenMessage, user]);

  // Fetch initial counts
  useEffect(() => {
    if (!user) return;
    
    async function fetchCounts() {
      try {
        // For receivers: Count new donations since last seen
        if (userType === "receiver") {
          const { data: donations, error: donationError } = await supabase
            .from('donations')
            .select('created_at')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });
            
          if (donationError) throw donationError;
          
          if (donations && donations.length > 0) {
            const newCount = lastSeenDonation 
              ? donations.filter(d => new Date(d.created_at) > new Date(lastSeenDonation)).length
              : donations.length;
              
            setUnreadDonationCount(newCount);
          }
        }
        
        // For both: Count unread messages
        const { data: messages, error: messageError } = await supabase
          .from('messages')
          .select('created_at, is_read, user_type')
          .eq('is_read', false)
          .not('user_id', 'eq', user.id);
          
        if (messageError) throw messageError;
        
        if (messages) {
          // Filter messages meant for current user type
          // Donors see messages from receivers, receivers see messages from donors
          const relevantMessages = messages.filter(m => 
            (userType === 'donor' && m.user_type === 'receiver') || 
            (userType === 'receiver' && m.user_type === 'donor')
          );
          
          setUnreadMessageCount(relevantMessages.length);
        }
      } catch (err) {
        console.error('Error fetching notification counts:', err);
      }
    }
    
    fetchCounts();
  }, [user, userType, lastSeenDonation]);
  
  // Set up real-time listeners
  useEffect(() => {
    if (!user) return;
    
    // Listen for new donations (for receivers)
    const donationChannel = userType === "receiver" ? supabase
      .channel('public:donations')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'donations',
      }, (payload) => {
        console.log('New donation:', payload);
        setUnreadDonationCount(prev => prev + 1);
        
        toast({
          title: "New Donation Available",
          description: "A new donation has been added that you might be interested in.",
        });
      })
      .subscribe() : null;
      
    // Listen for message status changes
    const messageChannel = supabase
      .channel('public:messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
      }, async (payload) => {
        console.log('Message event:', payload);
        
        // If it's a new message not from the current user
        if (payload.eventType === 'INSERT' && payload.new.user_id !== user.id) {
          // Check if the message is from the relevant user type
          const isRelevant = (userType === 'donor' && payload.new.user_type === 'receiver') || 
                             (userType === 'receiver' && payload.new.user_type === 'donor');
                             
          if (isRelevant) {
            setUnreadMessageCount(prev => prev + 1);
            
            // For donors, show a toast notification about the new message
            if (userType === 'donor') {
              // Get sender details if available
              let senderName = "A receiver";
              try {
                const { data } = await supabase
                  .from('profiles')
                  .select('first_name, last_name')
                  .eq('id', payload.new.user_id)
                  .single();
                  
                if (data && (data.first_name || data.last_name)) {
                  senderName = `${data.first_name || ''} ${data.last_name || ''}`.trim();
                }
              } catch (err) {
                console.error('Error fetching sender details:', err);
              }
              
              toast({
                title: "New Message",
                description: `${senderName} has sent you a message.`,
              });
            }
          }
        }
        // If messages are marked as read, update the count
        else if (payload.eventType === 'UPDATE' && payload.old.is_read === false && payload.new.is_read === true) {
          setUnreadMessageCount(prev => Math.max(0, prev - 1));
        }
      })
      .subscribe();
    
    return () => {
      if (donationChannel) supabase.removeChannel(donationChannel);
      supabase.removeChannel(messageChannel);
    };
  }, [user, userType, toast]);
  
  // Mark donations as seen
  const markDonationsSeen = () => {
    if (!user) return;
    const now = new Date().toISOString();
    setLastSeenDonation(now);
    setUnreadDonationCount(0);
  };
  
  // Mark messages as seen
  const markMessagesSeen = () => {
    if (!user) return;
    const now = new Date().toISOString();
    setLastSeenMessage(now);
  };
  
  return {
    unreadDonationCount,
    unreadMessageCount,
    markDonationsSeen,
    markMessagesSeen
  };
};
