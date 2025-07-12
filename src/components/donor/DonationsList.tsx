
import { Loader2 } from "lucide-react";
import DonationCard from "@/components/donor/DonationCard";
import { DonorDonation } from "@/types/donorDashboard";

interface DonationsListProps {
  donations: DonorDonation[];
  isLoading: boolean;
  error: string | null;
  timeRemainingMap: Record<number, string | null>;
  onDeleteDonation?: (id: number) => Promise<void>;
  onRecipientSelected?: () => void;
}

export const DonationsList = ({
  donations,
  isLoading,
  error,
  timeRemainingMap,
  onDeleteDonation,
  onRecipientSelected
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
      </div>
    );
  }

  if (donations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You haven't added any donations yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {donations.map((donation) => (
        <DonationCard
          key={donation.id}
          id={donation.id}
          itemName={donation.item_name}
          quantity={donation.quantity}
          category={donation.category}
          status={donation.status}
          createdAt={donation.created_at}
          description={donation.description}
          expiryTime={donation.expiry_time}
          timeRemaining={timeRemainingMap[donation.id]}
          receiver={donation.receiver}
          pickupRequests={donation.pickup_requests}
          images={donation.images}
          onDelete={onDeleteDonation}
          onRecipientSelected={onRecipientSelected}
        />
      ))}
    </div>
  );
};
