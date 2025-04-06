
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
import { Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";

const ReceiverDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isSubmittingDonation, setIsSubmittingDonation] = useState(false);
  const [showPickupDialog, setShowPickupDialog] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const { unreadMessageCount } = useNotifications("receiver");

  const { 
    donations, 
    isLoading, 
    error, 
    updateDonationStatus,
    fetchDonations 
  } = useReceiverDonations(user?.id);

  useEffect(() => {
    let isMounted = true;
    
    if (user) {
      const loadData = async () => {
        try {
          await fetchDonations('pending');
        } catch (err) {
          console.error("Error loading donations:", err);
        } finally {
          // Only update state if component is still mounted
          if (isMounted) {
            setIsLoadingInitial(false);
          }
        }
      };
      
      loadData();
    } else {
      setIsLoadingInitial(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, [user, fetchDonations]);

  const handleAcceptDonation = async (donationId: number, pickupTime: string) => {
    if (!user) return;
    
    try {
      setIsSubmittingDonation(true);
      
      // Check if it's an expired food item
      const donation = donations.find(d => d.id === donationId);
      if (donation?.category === 'food' && donation?.expiry_time) {
        const expiryTime = new Date(donation.expiry_time);
        const now = new Date();
        
        if (expiryTime <= now) {
          toast({
            title: "Cannot accept expired food",
            description: "This food item has expired and cannot be accepted.",
            variant: "destructive",
          });
          setIsSubmittingDonation(false);
          setShowPickupDialog(false);
          setSelectedDonation(null);
          return;
        }
      }
      
      // First insert the pickup request
      const { error: pickupError } = await supabase
        .from('pickup_requests')
        .insert({
          donation_id: donationId,
          user_id: user.id,
          pickup_time: pickupTime,
        });

      if (pickupError) throw pickupError;

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

  const handleOpenDonation = (donation: Donation) => {
    // Check if it's an expired food item before opening the dialog
    if (donation.category === 'food' && donation.expiry_time) {
      const expiryTime = new Date(donation.expiry_time);
      const now = new Date();
      
      if (expiryTime <= now) {
        toast({
          title: "Expired Food Item",
          description: "This food item has expired and cannot be accepted.",
          variant: "destructive",
        });
        return;
      }
    }
    
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

  // Show a clear loading state when the page is first loading
  if (isLoadingInitial) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-500">Loading available donations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Available Donations</h1>
            <Button 
              onClick={() => navigate("/receiver/message")} 
              className="flex items-center gap-2 bg-receiver-primary hover:bg-receiver-hover"
            >
              <MessageSquare className="h-4 w-4" />
              Send Message
            </Button>
          </div>

          {isLoading && !isLoadingInitial ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin rounded-full text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-8 bg-red-50 rounded-lg p-4 border border-red-100">
              <p className="text-red-500">{error}</p>
              <button 
                onClick={() => fetchDonations('pending')}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Try again
              </button>
            </div>
          ) : donations.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg p-8">
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
