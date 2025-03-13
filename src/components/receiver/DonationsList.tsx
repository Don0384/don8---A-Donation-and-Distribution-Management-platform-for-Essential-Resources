
import { Loader2 } from "lucide-react";
import { Donation } from "@/types/receiverDashboard";
import { DonationItem } from "./DonationItem";

interface DonationsListProps {
  isLoading: boolean;
  error: string | null;
  filteredDonations: Donation[];
  selectedStatus: string;
  onAction: (donationId: number, action: 'received' | 'rejected') => void;
}

export const DonationsList = ({
  isLoading,
  error,
  filteredDonations,
  selectedStatus,
  onAction
}: DonationsListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 text-blue-500 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (filteredDonations.length === 0) {
    return (
      <p className="text-gray-600 text-center py-8">
        {selectedStatus === 'All'
          ? 'No donations available.'
          : selectedStatus === 'pending'
          ? 'No pending donations available.'
          : selectedStatus === 'received'
          ? 'You haven\'t accepted any donations yet.'
          : 'No rejected donations.'}
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {filteredDonations.map((donation) => (
        <DonationItem 
          key={donation.id} 
          donation={donation} 
          onAction={onAction}
        />
      ))}
    </div>
  );
};
