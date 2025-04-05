
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { FilterControls } from "@/components/receiver/FilterControls";
import { DonationsList } from "@/components/receiver/DonationsList";
import { DonationConfirmationDialog } from "@/components/receiver/DonationConfirmationDialog";
import { PickupTimeDialog } from "@/components/receiver/PickupTimeDialog";
import { useReceiverDonations } from "@/hooks/useReceiverDonations";
import { useNotifications } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ReceiverDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pickupDialogOpen, setPickupDialogOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<{
    id: number;
    action: 'received' | null;
    name?: string;
  }>({ id: 0, action: null });

  const { unreadDonationCount, markDonationsSeen } = useNotifications("receiver");

  const {
    donations,
    isLoading,
    error,
    fetchDonations,
    updateDonationStatus,
    setDonations
  } = useReceiverDonations(user?.id);

  // Only fetch donations when user changes or status changes
  useEffect(() => {
    if (!user) return;
    
    fetchDonations(selectedStatus);
    
    // Mark donations as seen when viewing pending donations
    if (selectedStatus === "pending" || selectedStatus === "All") {
      markDonationsSeen();
    }
  }, [selectedStatus, user?.id]);

  const openPickupDialog = (donationId: number, action: 'received' | 'rejected', name: string) => {
    setSelectedDonation({ id: donationId, action, name });
    setPickupDialogOpen(true);
  };

  const handlePickupTimeSubmit = async (pickupTime: string) => {
    if (!selectedDonation.id || !user) return;
    
    try {
      // First, store the pickup request
      const { error: insertError } = await supabase
        .from('pickup_requests')
        .insert({
          donation_id: selectedDonation.id,
          user_id: user.id,
          pickup_time: pickupTime
        });
        
      if (insertError) throw insertError;
      
      toast({
        title: "Request submitted",
        description: "Your pickup time has been submitted and the donor will be notified.",
      });
      
      // Update the donation to show the request
      const updatedDonation = donations.find(d => d.id === selectedDonation.id);
      if (updatedDonation) {
        const donation = {
          ...updatedDonation,
          pickup_requests: [
            ...updatedDonation.pickup_requests || [],
            {
              user_id: user.id,
              donation_id: selectedDonation.id,
              pickup_time: pickupTime,
              created_at: new Date().toISOString()
            }
          ]
        };
        
        setDonations(prev => 
          prev.map(d => d.id === selectedDonation.id ? donation : d)
        );
      }
    } catch (error: any) {
      console.error("Error submitting pickup time:", error);
      toast({
        title: "Error",
        description: "Failed to submit pickup time. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async () => {
    if (!selectedDonation.action || !user) return;
    
    const success = await updateDonationStatus(selectedDonation.id, selectedDonation.action);
    
    if (success) {
      if (selectedStatus === 'All') {
        setDonations(prev => 
          prev.map(donation => 
            donation.id === selectedDonation.id
              ? { ...donation, status: selectedDonation.action as string, receiver_id: user.id }
              : donation
          )
        );
      } else if (selectedStatus === 'pending') {
        setDonations(prev => 
          prev.filter(donation => donation.id !== selectedDonation.id)
        );
      }
      
      if (selectedStatus === selectedDonation.action) {
        setTimeout(() => {
          fetchDonations(selectedStatus);
        }, 500);
      }
    }
    
    setDialogOpen(false);
    setSelectedDonation({ id: 0, action: null });
  };

  const filteredDonations = donations.filter(donation => 
    (selectedCategory === "All" || donation.category === selectedCategory)
  );

  const getStatusTitle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Available Donations';
      case 'received':
        return 'Accepted Donations';
      case 'rejected':
        return 'Rejected Donations';
      default:
        return 'All Donations';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {getStatusTitle(selectedStatus)}
              
              {unreadDonationCount > 0 && selectedStatus !== "pending" && (
                <span className="ml-3 inline-flex">
                  <Badge variant="destructive" className="text-xs">
                    {unreadDonationCount} new
                  </Badge>
                </span>
              )}
            </h1>
            
            <div className="flex items-center gap-4">
              <FilterControls
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
              />
            </div>
          </div>
          
          <DonationsList
            isLoading={isLoading}
            error={error}
            filteredDonations={filteredDonations}
            selectedStatus={selectedStatus}
            onAction={(id, action) => {
              const donation = donations.find(d => d.id === id);
              if (donation) {
                openPickupDialog(id, action, donation.item_name);
              }
            }}
          />
        </div>
      </div>

      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => navigate("/receiver/message")}
          className="w-14 h-14 bg-receiver-primary hover:bg-receiver-hover text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200"
          aria-label="Write message"
        >
          <Edit className="w-5 h-5" />
        </button>
      </div>

      <DonationConfirmationDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleStatusChange}
        action={selectedDonation.action}
      />
      
      <PickupTimeDialog
        isOpen={pickupDialogOpen}
        onOpenChange={setPickupDialogOpen}
        onConfirm={handlePickupTimeSubmit}
        itemName={selectedDonation.name || "this donation"}
      />
    </div>
  );
};

export default ReceiverDashboard;
