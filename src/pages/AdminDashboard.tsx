
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Filter, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface DonationWithProfiles {
  id: number;
  item_name: string;
  quantity: string;
  category: string;
  description: string;
  location: string;
  status: "pending" | "received" | "rejected";
  created_at: string;
  updated_at?: string;
  donor: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  } | null;
  receiver: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  } | null;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [donations, setDonations] = useState<DonationWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchDonations();
  }, [user, statusFilter]);

  const fetchDonations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabase
        .from("donations")
        .select(`
          *,
          donor:donor_id (id, email:id, first_name, last_name),
          receiver:receiver_id (id, email:id, first_name, last_name)
        `);

      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;

      // Map the data to include email
      const enhancedData = await Promise.all(
        (data || []).map(async (donation) => {
          let donorEmail = null;
          let receiverEmail = null;

          if (donation.donor?.id) {
            const { data: userData } = await supabase.auth.admin.getUserById(
              donation.donor.id
            );
            donorEmail = userData?.user?.email || null;
          }

          if (donation.receiver?.id) {
            const { data: userData } = await supabase.auth.admin.getUserById(
              donation.receiver.id
            );
            receiverEmail = userData?.user?.email || null;
          }

          return {
            ...donation,
            donor: donation.donor
              ? { ...donation.donor, email: donorEmail }
              : null,
            receiver: donation.receiver
              ? { ...donation.receiver, email: receiverEmail }
              : null,
          };
        })
      );

      setDonations(enhancedData);
    } catch (error) {
      console.error("Error fetching donations:", error);
      toast({
        title: "Error fetching donations",
        description:
          "There was a problem loading the donations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "received":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "PPP p");
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Monitor all donations and their status
          </p>
        </div>

        <div className="flex gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {statusFilter ? `Status: ${statusFilter}` : "Filter by status"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                All statuses
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("received")}>
                Received
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("rejected")}>
                Rejected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            onClick={fetchDonations}
            className="gap-2"
            title="Refresh donations"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Donations</CardTitle>
          <CardDescription>
            Full details of all donations in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : donations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No donations found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Donor</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{donation.item_name}</div>
                          <div className="text-xs text-gray-500">
                            {donation.quantity} · {donation.category}
                          </div>
                          {donation.description && (
                            <div className="text-xs text-gray-500 mt-1">
                              {donation.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {donation.donor ? (
                          <div>
                            <div>
                              {donation.donor.first_name}{" "}
                              {donation.donor.last_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {donation.donor.email}
                            </div>
                          </div>
                        ) : (
                          "Unknown"
                        )}
                      </TableCell>
                      <TableCell>
                        {donation.receiver ? (
                          <div>
                            <div>
                              {donation.receiver.first_name}{" "}
                              {donation.receiver.last_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {donation.receiver.email}
                            </div>
                          </div>
                        ) : (
                          "Not assigned"
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusClass(
                            donation.status
                          )}`}
                        >
                          {donation.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(donation.created_at)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {donation.updated_at
                          ? formatDate(donation.updated_at)
                          : "Not updated"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
