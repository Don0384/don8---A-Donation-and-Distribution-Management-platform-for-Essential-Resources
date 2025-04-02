
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Donation } from "@/types/receiverDashboard";
import { setupDonationDeleteListener } from "@/services/donationService";

export const useReceiverDonations = (userId: string | undefined) => {
  const { toast } = useToast();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchDonations = async (status: string = 'All') => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      
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
      setDonations(data || []);
    } catch (err: any) {
      console.error('Error fetching donations:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for donation deletions
  useEffect(() => {
    if (!userId) return;
    
    // Set up realtime listener for donation deletions
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
    if (!userId) return;
    
    try {
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
