
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import DashboardHeader from "@/components/admin/DashboardHeader";
import RefreshButton from "@/components/admin/RefreshButton";
import DonationTable from "@/components/admin/DonationTable";
import DonationStats from "@/components/admin/DonationStats";
import StatusFilter from "@/components/admin/StatusFilter";
import UserReportsTable from "@/components/admin/UserReportsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDonations } from "@/hooks/useDonations";
import { Loader2 } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    donations, 
    loading, 
    error,
    statusFilter, 
    setStatusFilter, 
    fetchDonations, 
    removeDonation 
  } = useDonations();

  const handleRefresh = () => {
    fetchDonations();
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status === "all" ? null : status);
  };

  const handleDonationRemoved = (donationId: number) => {
    removeDonation(donationId);
    toast({
      title: "Donation removed",
      description: "The donation has been successfully removed."
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <DashboardHeader title="Admin Dashboard">
              <RefreshButton onClick={handleRefresh} loading={loading} />
            </DashboardHeader>
            <div className="bg-white p-6 rounded-lg shadow-sm mt-4">
              <div className="text-center text-red-500 py-8">
                <p>Error loading dashboard: {error}</p>
                <button 
                  onClick={handleRefresh}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <DashboardHeader title="Admin Dashboard">
            <RefreshButton onClick={handleRefresh} loading={loading} />
          </DashboardHeader>

          <Tabs defaultValue="donations" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="donations">Donations</TabsTrigger>
              <TabsTrigger value="reports">User Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="donations" className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  <DonationStats donations={donations} />

                  <div className="flex justify-end mb-4">
                    <StatusFilter 
                      selectedStatus={statusFilter || "all"} 
                      onStatusChange={handleStatusChange} 
                    />
                  </div>

                  <DonationTable 
                    donations={donations} 
                    loading={loading} 
                    onDonationRemoved={handleDonationRemoved}
                  />
                </>
              )}
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
