
import { Donation } from "@/types/donorDashboard";
import DonationCard from "./DonationCard";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DonationsListProps {
  donations: Donation[];
  isLoading: boolean;
  error: string | null;
  timeRemainingMap: Record<number, string | null>;
}

export const DonationsList = ({
  donations,
  isLoading,
  error,
  timeRemainingMap
}: DonationsListProps) => {
  const { toast } = useToast();
  
  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('donations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Donation removed",
        description: "Your donation has been removed successfully."
      });
    } catch (err: any) {
      console.error("Error removing donation:", err);
      toast({
        title: "Error",
        description: "Failed to remove donation. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md my-4">
        <p className="font-semibold">Error loading donations</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }
  
  if (donations.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">You haven't made any donations yet.</p>
      </div>
    );
  }
  
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {donations.map((donation) => (
        <DonationCard
          key={donation.id}
          id={donation.id}
          itemName={donation.item_name}
          quantity={donation.quantity}
          category={donation.category}
          status={donation.status}
          createdAt={donation.created_at}
          description={donation.description || undefined}
          expiryTime={donation.expiry_time}
          timeRemaining={timeRemainingMap[donation.id]}
          receiver={donation.receiver}
          pickupRequests={donation.pickup_requests}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};
