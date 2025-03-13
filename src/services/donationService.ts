
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
          const { data: donorProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', donation.donor_id)
            .single();
            
          if (donorProfile) {
            // Also get user data from auth for the email
            const { data: userData } = await supabase.auth.admin.getUserById(donation.donor_id);
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
          const { data: receiverProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', donation.receiver_id)
            .single();
            
          if (receiverProfile) {
            // Also get user data from auth for the email
            const { data: userData } = await supabase.auth.admin.getUserById(donation.receiver_id);
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
