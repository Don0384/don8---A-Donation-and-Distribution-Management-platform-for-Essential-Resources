
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatTimeRemaining } from "@/utils/dateUtils";
import { useAuth } from "@/context/AuthContext";
import { setupDonationDeleteListener } from "@/services/donationService";
import { DonorDonation } from "@/types/donorDashboard";

export const useDonorDonations = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<DonorDonation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemainingMap, setTimeRemainingMap] = useState<Record<number, string | null>>({});
  
  // Fetch donations
  useEffect(() => {
    if (!user) return;

    async function fetchDonations() {
      try {
        setIsLoading(true);
        
        // First get all donations
        const { data, error } = await supabase
          .from('donations')
          .select('*')
          .eq('donor_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Manually join the receiver information
        const donationsWithReceivers = await Promise.all((data || []).map(async (donation) => {
          let receiver = null;
          
          if (donation.receiver_id) {
            // Get profile info for the receiver
            const { data: receiverProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', donation.receiver_id)
              .single();
              
            if (receiverProfile) {
              // Get user auth data for email
              receiver = {
                id: donation.receiver_id,
                email: receiverProfile.username || "",
                first_name: receiverProfile.first_name,
                last_name: receiverProfile.last_name,
                phone: null // We don't have phone in profile currently
              };
            }
          }
          
          // Get pickup requests for this donation
          const { data: pickupRequests } = await supabase
            .from('pickup_requests')
            .select('*')
            .eq('donation_id', donation.id)
            .order('pickup_time', { ascending: true });
            
          // Construct the enhanced donation with receiver and pickup requests
          return {
            ...donation,
            receiver,
            pickup_requests: pickupRequests || []
          } as DonorDonation;
        }));
        
        setDonations(donationsWithReceivers);
        
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
        if (donation.expiry_time) {
          updatedTimeMap[donation.id] = formatTimeRemaining(donation.expiry_time);
        }
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
