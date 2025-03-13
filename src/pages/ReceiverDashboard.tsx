
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { FilterControls } from "@/components/receiver/FilterControls";
import { DonationsList } from "@/components/receiver/DonationsList";
import { DonationConfirmationDialog } from "@/components/receiver/DonationConfirmationDialog";
import { useReceiverDonations } from "@/hooks/useReceiverDonations";

const ReceiverDashboard = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<{
    id: number;
    action: 'received' | 'rejected' | null;
  }>({ id: 0, action: null });

  const {
    donations,
    isLoading,
    error,
    fetchDonations,
    updateDonationStatus,
    setDonations
  } = useReceiverDonations(user?.id);

  useEffect(() => {
    if (!user) return;
    fetchDonations(selectedStatus);
  }, [selectedStatus, user]);

  const openConfirmDialog = (donationId: number, action: 'received' | 'rejected') => {
    setSelectedDonation({ id: donationId, action });
    setDialogOpen(true);
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
            </h1>
            
            <FilterControls
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            />
          </div>
          
          <DonationsList
            isLoading={isLoading}
            error={error}
            filteredDonations={filteredDonations}
            selectedStatus={selectedStatus}
            onAction={openConfirmDialog}
          />
        </div>
      </div>

      <DonationConfirmationDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleStatusChange}
        action={selectedDonation.action}
      />
    </div>
  );
};

export default ReceiverDashboard;
