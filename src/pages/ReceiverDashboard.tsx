
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { FilterControls } from "@/components/receiver/FilterControls";
import { DonationsList } from "@/components/receiver/DonationsList";
import { DonationConfirmationDialog } from "@/components/receiver/DonationConfirmationDialog";
import { useReceiverDonations } from "@/hooks/useReceiverDonations";
import { useNavigate } from "react-router-dom";
import { Edit, UserCircle } from "lucide-react";

const ReceiverDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<{
    id: number;
    action: 'received' | null;
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
    setSelectedDonation({ id: donationId, action: 'received' });
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
            onAction={openConfirmDialog}
          />
        </div>
      </div>

      <div className="fixed bottom-6 right-6 flex flex-col space-y-3">
        <button
          onClick={() => navigate("/receiver/profile")}
          className="w-14 h-14 bg-gray-700 hover:bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200"
          aria-label="View profile"
        >
          <UserCircle className="w-6 h-6" />
        </button>
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
    </div>
  );
};

export default ReceiverDashboard;
