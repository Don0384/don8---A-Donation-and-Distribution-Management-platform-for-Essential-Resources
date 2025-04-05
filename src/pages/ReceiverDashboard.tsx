
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Donation } from "@/types/receiverDashboard";
import Navbar from "@/components/Navbar";
import { DonationCard } from "@/components/receiver/DonationCard";
import { PickupTimeDialog } from "@/components/receiver/PickupTimeDialog";
import { useReceiverDonations } from "@/hooks/useReceiverDonations";

const ReceiverDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isSubmittingDonation, setIsSubmittingDonation] = useState(false);
  const [showPickupDialog, setShowPickupDialog] = useState(false);

  const { 
    donations, 
    isLoading, 
    error, 
    updateDonationStatus,
    fetchDonations 
  } = useReceiverDonations(user?.id);

  useEffect(() => {
    if (user) {
      fetchDonations('pending');
    }
  }, [user, fetchDonations]);

  const handleAcceptDonation = async (donationId: number, pickupTime: string) => {
    try {
      setIsSubmittingDonation(true);
      // First insert the pickup request
      const { error: pickupError } = await supabase
        .from('pickup_requests')
        .insert({
          donation_id: donationId,
          user_id: user?.id,
          pickup_time: pickupTime,
        });

      if (pickupError) throw pickupError;

      // Update UI
      const updatedDonations = donations.map((d) => {
        if (d.id === donationId) {
          // Add the new pickup request to the donation's pickup_requests array
          const updatedPickupRequests = [
            ...(d.pickup_requests || []),
            {
              user_id: user?.id || '',
              pickup_time: pickupTime,
              created_at: new Date().toISOString(),
              donation_id: donationId,
            },
          ];
          return { ...d, pickup_requests: updatedPickupRequests };
        }
        return d;
      });

      toast({
        title: "Pickup request submitted",
        description:
          "Your pickup request has been sent to the donor. We'll notify you when it's accepted.",
      });
    } catch (err: any) {
      console.error("Error submitting pickup request:", err);
      toast({
        title: "Error",
        description: "Failed to submit pickup request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingDonation(false);
      setSelectedDonation(null);
      setShowPickupDialog(false);
    }
  };

  const handleRejectDonation = async (donationId: number) => {
    try {
      setIsSubmittingDonation(true);
      const success = await updateDonationStatus(donationId, 'rejected');
      if (success) {
        // UI updates are handled within the updateDonationStatus function
        toast({
          title: "Donation Rejected",
          description: "You have rejected this donation.",
        });
      }
    } catch (err: any) {
      console.error("Error rejecting donation:", err);
      toast({
        title: "Error",
        description: "Failed to reject donation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingDonation(false);
      setSelectedDonation(null);
    }
  };

  const handleOpenDonation = (donation: Donation) => {
    setSelectedDonation(donation);
    setShowPickupDialog(true);
  };

  const handleUpdateStatus = async (donationId: number, status: 'received' | 'rejected') => {
    try {
      setIsSubmittingDonation(true);
      const success = await updateDonationStatus(donationId, status);
      if (success) {
        // UI updates are handled within the updateDonationStatus function
      }
    } catch (err: any) {
      console.error("Error updating donation status:", err);
    } finally {
      setIsSubmittingDonation(false);
      setSelectedDonation(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Available Donations</h1>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          ) : donations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No donations available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {donations.map((donation) => (
                <DonationCard
                  key={donation.id}
                  donation={donation}
                  onOpen={() => handleOpenDonation(donation)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedDonation && (
        <PickupTimeDialog
          isOpen={showPickupDialog}
          onOpenChange={setShowPickupDialog}
          onConfirm={(pickupTime) => handleAcceptDonation(selectedDonation.id, pickupTime)}
          itemName={selectedDonation.item_name}
        />
      )}
    </div>
  );
};

export default ReceiverDashboard;
