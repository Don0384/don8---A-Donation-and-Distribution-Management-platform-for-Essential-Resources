
import { supabase } from "@/integrations/supabase/client";
import { type DonationWithProfiles, type DonationStatus } from "@/types/donations";

export const fetchDonationsWithProfiles = async (): Promise<DonationWithProfiles[]> => {
  try {
    const { data: donationsData, error } = await supabase
      .from("donations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (!donationsData) {
      return [];
    }

    // For each donation, fetch donor and receiver details
    const enhancedDonations: DonationWithProfiles[] = await Promise.all(
      donationsData.map(async (donation) => {
        // Get donor details
        let donor = null;
        if (donation.donor_id) {
          // Get user data for email and phone
          const { data: userData } = await supabase.auth.admin.getUserById(donation.donor_id);
          
          // Get profile data for names
          const { data: donorProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', donation.donor_id)
            .single();
            
          if (donorProfile) {
            donor = {
              id: donation.donor_id,
              email: userData?.user?.email || "",
              first_name: donorProfile.first_name || null,
              last_name: donorProfile.last_name || null,
              phone: userData?.user?.user_metadata?.phone || null,
            };
          }
        }

        // Get receiver details
        let receiver = null;
        if (donation.receiver_id) {
          // Get user data for email and phone
          const { data: userData } = await supabase.auth.admin.getUserById(donation.receiver_id);
          
          // Get profile data for names
          const { data: receiverProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', donation.receiver_id)
            .single();
            
          if (receiverProfile) {
            receiver = {
              id: donation.receiver_id,
              email: userData?.user?.email || "",
              first_name: receiverProfile.first_name || null,
              last_name: receiverProfile.last_name || null,
              phone: userData?.user?.user_metadata?.phone || null,
            };
          }
        }

        // Ensure status is of the correct type
        const status = (donation.status as string).toLowerCase();
        const validatedStatus: DonationStatus = 
          status === 'received' ? "received" :
          status === 'rejected' ? "rejected" : "pending";

        return {
          ...donation,
          donor,
          receiver,
          status: validatedStatus,
          expiry_time: donation.expiry_time
        } as DonationWithProfiles;
      })
    );

    return enhancedDonations;
  } catch (error: any) {
    console.error("Error fetching donations:", error);
    throw error;
  }
};

// New function to delete a donation completely (used by admin)
export const deleteDonation = async (donationId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("donations")
      .delete()
      .eq("id", donationId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting donation:", error);
    return false;
  }
};

// Setup a subscription to donation deletions
export const setupDonationDeleteListener = (onDelete: (donationId: number) => void) => {
  const channel = supabase
    .channel('public:donations')
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'donations',
      },
      (payload) => {
        // Extract the donation ID from the payload
        const deletedDonationId = payload.old?.id;
        if (deletedDonationId) {
          onDelete(deletedDonationId);
        }
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
};
