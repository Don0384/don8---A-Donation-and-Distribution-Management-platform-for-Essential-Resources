
import { useState } from "react";
import Navbar from "@/components/Navbar";
import DashboardHeader from "@/components/admin/DashboardHeader";
import DonationStats from "@/components/admin/DonationStats";
import DonationTable from "@/components/admin/DonationTable";
import StatusFilter from "@/components/admin/StatusFilter";
import { useAuth } from "@/context/AuthContext";
import { useDonations } from "@/hooks/useDonations";
import { UserReportsTable } from "@/components/admin/UserReportsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const {
    donations,
    loading,
    statusFilter,
    setStatusFilter,
    removeDonation,
  } = useDonations();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DashboardHeader user={user} />
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mt-8"
        >
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="reports">User Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            <DonationStats donations={donations} />
            
            <div className="bg-white shadow rounded-lg p-4 md:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-xl font-bold">All Donations</h2>
                <StatusFilter
                  selectedStatus={statusFilter}
                  onStatusChange={setStatusFilter}
                />
              </div>
              
              <DonationTable 
                donations={donations} 
                loading={loading} 
                onDonationRemoved={removeDonation}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="reports" className="mt-6">
            <div className="bg-white shadow rounded-lg p-6">
              <UserReportsTable />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
