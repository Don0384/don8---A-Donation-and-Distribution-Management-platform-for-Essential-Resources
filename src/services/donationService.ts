
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
          try {
            const { data: donorData } = await supabase.auth.admin.getUserById(donation.donor_id);
            if (donorData && donorData.user) {
              donor = {
                id: donorData.user.id,
                email: donorData.user.email || "",
                first_name: donorData.user.user_metadata?.first_name || null,
                last_name: donorData.user.user_metadata?.last_name || null,
                phone: donorData.user.user_metadata?.phone || null,
              };
            }
          } catch (err) {
            console.error("Error fetching donor details:", err);
          }
        }

        // Get receiver details
        let receiver = null;
        if (donation.receiver_id) {
          try {
            const { data: receiverData } = await supabase.auth.admin.getUserById(donation.receiver_id);
            if (receiverData && receiverData.user) {
              receiver = {
                id: receiverData.user.id,
                email: receiverData.user.email || "",
                first_name: receiverData.user.user_metadata?.first_name || null,
                last_name: receiverData.user.user_metadata?.last_name || null,
                phone: receiverData.user.user_metadata?.phone || null,
              };
            }
          } catch (err) {
            console.error("Error fetching receiver details:", err);
          }
        }

        // Ensure status is of the correct type
        const status = (donation.status as string).toLowerCase();
        const validatedStatus: DonationStatus = 
          status === "received" ? "received" :
          status === "rejected" ? "rejected" : "pending";

        return {
          ...donation,
          donor,
          receiver,
          status: validatedStatus
        } as DonationWithProfiles;
      })
    );

    return enhancedDonations;
  } catch (error: any) {
    console.error("Error fetching donations:", error);
    throw error;
  }
};
