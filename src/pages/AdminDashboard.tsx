
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define status type for type safety
type DonationStatus = "pending" | "received" | "rejected";

// Define the donation type with user profiles
interface DonationWithProfiles {
  id: number;
  item_name: string;
  description: string | null;
  category: string;
  quantity: string;
  location: string;
  status: DonationStatus;
  created_at: string;
  donor_id: string;
  receiver_id: string | null;
  donor: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
  } | null;
  receiver: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
  } | null;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const [donations, setDonations] = useState<DonationWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const fetchDonations = async () => {
    setLoading(true);

    try {
      const { data: donationsData, error } = await supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!donationsData) {
        setDonations([]);
        return;
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

      setDonations(enhancedDonations);
    } catch (error: any) {
      console.error("Error fetching donations:", error);
      toast({
        title: "Error",
        description: "Failed to fetch donations: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  // Filter donations based on status
  const filteredDonations = statusFilter
    ? donations.filter((donation) => donation.status === statusFilter)
    : donations;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex space-x-4">
          <Select
            value={statusFilter || ""}
            onValueChange={(value) => setStatusFilter(value || null)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchDonations}
            disabled={loading}
            title="Refresh"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receiver</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDonations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No donations found
                    </td>
                  </tr>
                ) : (
                  filteredDonations.map((donation) => (
                    <tr key={donation.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{donation.item_name}</div>
                        <div className="text-sm text-gray-500">{donation.category}</div>
                        <div className="text-xs text-gray-500">{donation.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {donation.donor ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {donation.donor.first_name} {donation.donor.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{donation.donor.email}</div>
                            <div className="text-xs text-gray-500">{donation.donor.phone}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Unknown donor</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {donation.receiver ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {donation.receiver.first_name} {donation.receiver.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{donation.receiver.email}</div>
                            <div className="text-xs text-gray-500">{donation.receiver.phone}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">No receiver yet</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${donation.status === 'received' ? 'bg-green-100 text-green-800' : 
                            donation.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(donation.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
