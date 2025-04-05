
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchDonationsWithProfiles } from "@/services/donationService";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import DashboardHeader from "@/components/admin/DashboardHeader";
import RefreshButton from "@/components/admin/RefreshButton";
import DonationTable from "@/components/admin/DonationTable";
import DonationStats from "@/components/admin/DonationStats";
import StatusFilter from "@/components/admin/StatusFilter";
import UserReportsTable from "@/components/admin/UserReportsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type DonationWithProfiles } from "@/types/donations";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [donations, setDonations] = useState<DonationWithProfiles[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<DonationWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    fetchAllDonations();
  }, []);

  useEffect(() => {
    if (selectedStatus === "all") {
      setFilteredDonations(donations);
    } else {
      setFilteredDonations(
        donations.filter((donation) => donation.status === selectedStatus)
      );
    }
  }, [donations, selectedStatus]);

  const fetchAllDonations = async () => {
    try {
      setLoading(true);
      const donationsData = await fetchDonationsWithProfiles();
      setDonations(donationsData);
      setFilteredDonations(donationsData);
    } catch (error: any) {
      console.error("Error fetching donations:", error);
      toast({
        title: "Error",
        description: "Failed to load donations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDonationRemoved = (donationId: number) => {
    setDonations((prev) => prev.filter((d) => d.id !== donationId));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <DashboardHeader title="Admin Dashboard">
            <RefreshButton onClick={fetchAllDonations} isLoading={loading} />
          </DashboardHeader>

          <Tabs defaultValue="donations" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="donations">Donations</TabsTrigger>
              <TabsTrigger value="reports">User Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="donations" className="space-y-6">
              <DonationStats donations={donations} />

              <div className="flex justify-end mb-4">
                <StatusFilter 
                  value={selectedStatus} 
                  onValueChange={setSelectedStatus} 
                />
              </div>

              <DonationTable 
                donations={filteredDonations} 
                loading={loading} 
                onDonationRemoved={handleDonationRemoved}
              />
            </TabsContent>

            <TabsContent value="reports">
              <UserReportsTable />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
