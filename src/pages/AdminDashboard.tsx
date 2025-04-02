
import { useDonations } from "@/hooks/useDonations";
import DashboardHeader from "@/components/admin/DashboardHeader";
import StatusFilter from "@/components/admin/StatusFilter";
import RefreshButton from "@/components/admin/RefreshButton";
import DonationTable from "@/components/admin/DonationTable";
import DonationStats from "@/components/admin/DonationStats";
import DonationDetails from "@/components/admin/DonationDetails";
import Navbar from "@/components/Navbar";

const AdminDashboard = () => {
  const {
    donations,
    loading,
    statusFilter,
    setStatusFilter,
    fetchDonations,
    removeDonation
  } = useDonations();

  const handleDonationRemoved = (donationId: number) => {
    removeDonation(donationId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader title="Admin Dashboard">
          <StatusFilter
            value={statusFilter || "all"}
            onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
          />
          <RefreshButton
            loading={loading}
            onClick={fetchDonations}
          />
        </DashboardHeader>

        {/* Dashboard Stats and Charts */}
        {!loading && (
          <DonationStats donations={donations} />
        )}

        {/* Detailed Data Tables */}
        {!loading && (
          <DonationDetails donations={donations} />
        )}

        <h2 className="text-xl font-semibold mt-8 mb-4">All Donations</h2>
        <DonationTable
          donations={donations}
          loading={loading}
          onDonationRemoved={handleDonationRemoved}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
