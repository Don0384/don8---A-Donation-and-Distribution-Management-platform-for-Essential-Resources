
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatTimeRemaining } from "@/utils/dateUtils";
import { useAuth } from "@/context/AuthContext";
import { setupDonationDeleteListener } from "@/services/donationService";
import { DonationUser } from "@/types/donations";

type Donation = {
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
  receiver: DonationUser | null;
  pickup_requests: Array<{
    user_id: string;
    pickup_time: string;
    created_at: string;
  }>;
  acceptance_deadline: string | null;
};

export const useDonorDonations = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemainingMap, setTimeRemainingMap] = useState<Record<number, string | null>>({});
  
  // Fetch donations
  useEffect(() => {
    if (!user) return;

    async function fetchDonations() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('donations')
          .select(`
            *,
            receiver:receiver_id(
              id:id,
              email:email,
              first_name:raw_user_meta_data->first_name,
              last_name:raw_user_meta_data->last_name,
              phone:raw_user_meta_data->phone
            )
          `)
          .eq('donor_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Get pickup requests for each donation
        const enhancedData = await Promise.all((data || []).map(async (donation) => {
          // @ts-ignore - This table exists but TypeScript doesn't know about it yet
          const { data: pickupRequests } = await supabase
            .from('pickup_requests')
            .select('*')
            .eq('donation_id', donation.id)
            .order('pickup_time', { ascending: true });
            
          return {
            ...donation,
            pickup_requests: pickupRequests || []
          };
        }));
        
        setDonations(enhancedData);
        
        // Initialize time remaining for food items
        const initialTimeMap: Record<number, string | null> = {};
        data?.forEach(donation => {
          if (donation.category === 'food' && donation.expiry_time) {
            initialTimeMap[donation.id] = formatTimeRemaining(donation.expiry_time);
          }
        });
        setTimeRemainingMap(initialTimeMap);
      } catch (err: any) {
        console.error('Error fetching donations:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDonations();
  }, [user]);
  
  // Enhanced listener for donation deletions
  useEffect(() => {
    if (!user) return;
    
    // Set up realtime listener for donation deletions
    const unsubscribe = setupDonationDeleteListener((deletedId) => {
      console.log("Donation deleted in donor dashboard:", deletedId);
      setDonations(prevDonations => prevDonations.filter(d => d.id !== deletedId));
      
      // Also clean up the timeRemainingMap
      setTimeRemainingMap(prev => {
        const updated = {...prev};
        delete updated[deletedId];
        return updated;
      });
    });
    
    return () => {
      unsubscribe();
    };
  }, [user]);
  
  // Update timers for food items with expiry time
  useEffect(() => {
    const foodDonations = donations.filter(d => d.category === 'food' && d.expiry_time);
    if (foodDonations.length === 0) return;
    
    const interval = setInterval(() => {
      const updatedTimeMap: Record<number, string | null> = {};
      
      foodDonations.forEach(donation => {
        updatedTimeMap[donation.id] = formatTimeRemaining(donation.expiry_time);
      });
      
      setTimeRemainingMap(prev => ({...prev, ...updatedTimeMap}));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [donations]);

  return {
    donations,
    isLoading,
    error,
    timeRemainingMap
  };
};
