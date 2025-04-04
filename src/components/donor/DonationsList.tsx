
import { Loader2 } from "lucide-react";
import { DonationCard } from "./DonationCard";

type Donation = {
  id: number;
  item_name: string;
  quantity: string;
  category: string;
  status: string;
  created_at: string;
  description: string | null;
  location: string;
  expiry_time: string | null;
  images: string[] | null; // Added this property to match DonationCard requirements
};

type DonationsListProps = {
  donations: Donation[];
  isLoading: boolean;
  error: string | null;
  timeRemainingMap: Record<number, string | null>;
};

export const DonationsList = ({
  donations,
  isLoading,
  error,
  timeRemainingMap
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

  if (donations.length === 0) {
    return (
      <p className="text-gray-600 text-center py-8">
        No donations yet. Click the + button to add your first donation.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {donations.map((donation) => (
        <DonationCard 
          key={donation.id} 
          donation={donation} 
          timeRemaining={timeRemainingMap[donation.id] || null} 
        />
      ))}
    </div>
  );
};
