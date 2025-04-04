
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatTimeRemaining } from "@/utils/dateUtils";
import { useAuth } from "@/context/AuthContext";
import { setupDonationDeleteListener } from "@/services/donationService";

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
  images: string[] | null; // Make sure images is included here as well
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
          .select('*')
          .eq('donor_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setDonations(data || []);
        
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
