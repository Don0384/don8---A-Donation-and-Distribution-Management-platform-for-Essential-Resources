
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { fetchDonationsWithProfiles } from "@/services/donationService";
import { type DonationWithProfiles } from "@/types/donations";
import { setupDonationDeleteListener } from "@/services/donationService";

export const useDonations = () => {
  const { toast } = useToast();
  const [donations, setDonations] = useState<DonationWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const fetchDonations = async () => {
    setLoading(true);
    setError(null);
    try {
      const enhancedDonations = await fetchDonationsWithProfiles();
      setDonations(enhancedDonations);
    } catch (error: any) {
      console.error("Error in useDonations hook:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to fetch donations: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeDonation = (donationId: number) => {
    setDonations(prev => prev.filter(donation => donation.id !== donationId));
    console.log(`Donation with ID ${donationId} removed from admin dashboard`);
  };

  useEffect(() => {
    fetchDonations();
    
    const unsubscribe = setupDonationDeleteListener((deletedId) => {
      console.log("Donation deleted in admin dashboard:", deletedId);
      removeDonation(deletedId);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  const filteredDonations = statusFilter
    ? donations.filter((donation) => donation.status === statusFilter)
    : donations;

  return {
    donations: filteredDonations,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    fetchDonations,
    removeDonation,
  };
};
