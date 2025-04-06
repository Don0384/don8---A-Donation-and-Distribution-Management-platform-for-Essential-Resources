
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Donation } from "@/types/receiverDashboard";
import { setupDonationDeleteListener } from "@/services/donationService";

export const useReceiverDonations = (userId: string | undefined) => {
  const { toast } = useToast();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchDonations = useCallback(async (status: string = 'All') => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      setError(null); // Clear any previous errors
      console.log("Fetching donations with status:", status);
      
      let query = supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (status !== "All") {
        query = query.eq('status', status);
      }
      
      if (status === 'received' || status === 'rejected') {
        query = query.eq('receiver_id', userId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      console.log("Retrieved donations:", data?.length);
      
      // Manually join donor information and pickup requests
      const enhancedData = await Promise.all((data || []).map(async (donation) => {
        // Get donor details
        let donor = null;
        if (donation.donor_id) {
          try {
            const { data: donorProfile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', donation.donor_id)
              .single();
              
            if (!profileError && donorProfile) {
              donor = {
                id: donation.donor_id,
                email: donorProfile.username || "",
                first_name: donorProfile.first_name,
                last_name: donorProfile.last_name,
                phone: null // We don't have phone in profile currently
              };
            }
          } catch (err) {
            console.error("Error fetching donor profile:", err);
          }
        }
        
        // Get pickup requests
        const { data: pickupRequests } = await supabase
          .from('pickup_requests')
          .select('*')
          .eq('donation_id', donation.id)
          .order('pickup_time', { ascending: true });
        
        // Ensure images is always an array (even if null in the database)
        const images = donation.images || [];
        
        console.log(`Donation ${donation.id} has ${images.length} images`);
        
        return {
          ...donation,
          donor,
          images: images,
          pickup_requests: pickupRequests || []
        } as Donation;
      }));
      
      setDonations(enhancedData);
    } catch (err: any) {
      console.error('Error fetching donations:', err);
      setError(err.message || "Failed to load donations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Enhanced listener for donation deletions
  useEffect(() => {
    if (!userId) return;
    
    // Set up realtime listener for donation deletions with improved logging
    const unsubscribe = setupDonationDeleteListener((deletedId) => {
      console.log("Donation deleted in receiver dashboard:", deletedId);
      setDonations(prevDonations => prevDonations.filter(d => d.id !== deletedId));
    });
    
    return () => {
      unsubscribe();
    };
  }, [userId]);

  const updateDonationStatus = async (
    donationId: number, 
    action: 'received' | 'rejected'
  ) => {
    if (!userId) return false;
    
    try {
      // First, get the donation details to check if it's an expired food item
      const { data: donationData, error: fetchError } = await supabase
        .from('donations')
        .select('*')
        .eq('id', donationId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Check if it's a food item and if it's expired
      if (donationData.category === 'food' && donationData.expiry_time) {
        const expiryTime = new Date(donationData.expiry_time);
        const now = new Date();
        
        if (expiryTime <= now && action === 'received') {
          toast({
            title: "Cannot accept expired food",
            description: "This food item has expired and cannot be accepted.",
            variant: "destructive",
          });
          return false;
        }
      }
      
      console.log('Updating donation with ID:', donationId);
      console.log('Setting status to:', action);
      console.log('Current user ID:', userId);
      
      const { error, data } = await supabase
        .from('donations')
        .update({ 
          status: action,
          receiver_id: userId
        })
        .eq('id', donationId)
        .select();
      
      console.log('Update response:', { error, data });
      
      if (error) throw error;
      
      toast({
        title: `Donation ${action}`,
        description: `The donation has been ${action} successfully.`,
        variant: action === 'received' ? 'default' : 'destructive',
      });
      
      // Update local state
      setDonations(prev => prev.map(d => 
        d.id === donationId ? { ...d, status: action, receiver_id: userId } : d
      ));
      
      return true;
    } catch (err: any) {
      console.error('Error updating donation status:', err);
      toast({
        title: "Error",
        description: err.message || "An error occurred while updating the donation status.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    donations,
    isLoading,
    error,
    fetchDonations,
    updateDonationStatus,
    setDonations
  };
};
