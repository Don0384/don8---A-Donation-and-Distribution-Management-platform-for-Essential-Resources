
import { useDonations } from "@/hooks/useDonations";
import DashboardHeader from "@/components/admin/DashboardHeader";
import StatusFilter from "@/components/admin/StatusFilter";
import RefreshButton from "@/components/admin/RefreshButton";
import DonationTable from "@/components/admin/DonationTable";

const AdminDashboard = () => {
  const {
    donations,
    loading,
    statusFilter,
    setStatusFilter,
    fetchDonations
  } = useDonations();

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader title="Admin Dashboard">
        <StatusFilter
          value={statusFilter || ""}
          onValueChange={(value) => setStatusFilter(value || null)}
        />
        <RefreshButton
          loading={loading}
          onClick={fetchDonations}
        />
      </DashboardHeader>

      <DonationTable
        donations={donations}
        loading={loading}
      />
    </div>
  );
};

export default AdminDashboard;
