import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Donation } from "@/types/receiverDashboard";
import { format } from 'date-fns';
import Navbar from "@/components/Navbar";
import { ReceiverDashboardHeader } from "@/components/receiver/ReceiverDashboardHeader";
import { DonationCard } from "@/components/receiver/DonationCard";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as ShadCalendar } from "@/components/ui/calendar";

const ReceiverDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isSubmittingDonation, setIsSubmittingDonation] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    async function fetchDonations() {
      if (!user) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('donations')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Manually join donor information and pickup requests
        const enhancedData = await Promise.all((data || []).map(async (donation) => {
          // Get donor details
          let donor = null;
          if (donation.donor_id) {
            const { data: donorProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', donation.donor_id)
              .single();

            if (donorProfile) {
              // Get user auth data for email
              const { data: userData } = await supabase.auth.admin.getUserById(donation.donor_id);

              donor = {
                id: donation.donor_id,
                email: userData?.user?.email || "",
                first_name: donorProfile.first_name,
                last_name: donorProfile.last_name,
                phone: userData?.user?.user_metadata?.phone || null
              };
            }
          }

          // Get pickup requests
          const { data: pickupRequests } = await supabase
            .from('pickup_requests')
            .select('*')
            .eq('donation_id', donation.id)
            .order('pickup_time', { ascending: true });

          return {
            ...donation,
            donor,
            images: donation.images || [],
            pickup_requests: pickupRequests || []
          } as Donation;
        }));

        setDonations(enhancedData);
      } catch (err: any) {
        console.error('Error fetching donations:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDonations();
  }, [user]);

  // Fix the updateDonationStatus type in line 55 to accept both 'received' and 'rejected'
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
      setDonations((prevDonations) => {
        return prevDonations.map((d) => {
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
    }
  };

  const handleRejectDonation = async (donationId: number) => {
    if (!user) return;

    try {
      setIsSubmittingDonation(true);
      const { error } = await supabase
        .from('donations')
        .update({ status: 'rejected', receiver_id: user.id })
        .eq('id', donationId);

      if (error) throw error;

      setDonations((prevDonations) =>
        prevDonations.map((d) =>
          d.id === donationId ? { ...d, status: 'rejected' } : d
        )
      );

      toast({
        title: "Donation Rejected",
        description: "You have rejected this donation.",
      });
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
  };

  const handleCloseDonation = () => {
    setSelectedDonation(null);
  };

  // Fix the issue when handling donation status updates (line 221)
  const handleUpdateStatus = async (donationId: number, status: 'received' | 'rejected') => {
    try {
      setIsSubmittingDonation(true);
      const success = await updateDonationStatus(donationId, status);
      if (success) {
        // Update local state
        setDonations((prevDonations) =>
          prevDonations.map((d) =>
            d.id === donationId ? { ...d, status } : d
          )
        );
      }
    } catch (err) {
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
          <ReceiverDashboardHeader title="Available Donations" />

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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen">
            <div className="relative bg-white rounded-lg max-w-2xl mx-auto p-6">
              <button
                onClick={handleCloseDonation}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <h2 className="text-2xl font-bold mb-4">{selectedDonation.item_name}</h2>
              <p className="text-gray-600 mb-4">{selectedDonation.description}</p>

              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Pickup Time</h3>
                <p className="text-gray-600">Select a date for pickup:</p>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={
                        "w-[240px] justify-start text-left font-normal" +
                        (!date ? " text-muted-foreground" : "")
                      }
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <ShadCalendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="secondary" onClick={handleCloseDonation}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (date) {
                      const pickupTime = date.toISOString();
                      handleAcceptDonation(selectedDonation.id, pickupTime);
                    } else {
                      toast({
                        title: "Error",
                        description: "Please select a pickup date.",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={isSubmittingDonation}
                >
                  Accept Donation
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleRejectDonation(selectedDonation.id)}
                  disabled={isSubmittingDonation}
                >
                  Reject Donation
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiverDashboard;
