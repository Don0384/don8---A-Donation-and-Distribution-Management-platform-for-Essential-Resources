
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { DonationsList } from "@/components/donor/DonationsList";
import { DashboardHeader } from "@/components/donor/DashboardHeader";
import { useDonorDonations } from "@/hooks/useDonorDonations";

const DonorDashboard = () => {
  const navigate = useNavigate();
  const { donations, isLoading, error, timeRemainingMap } = useDonorDonations();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <Navbar />
      <div className="flex-1 p-4">
        <div className="max-w-6xl mx-auto">
          <DashboardHeader title="My Donations" />
          
          <DonationsList 
            donations={donations}
            isLoading={isLoading}
            error={error}
            timeRemainingMap={timeRemainingMap}
          />

          <div className="fixed bottom-6 right-6">
            <button
              onClick={() => navigate("/add-donation")}
              className="w-14 h-14 bg-donor-primary hover:bg-donor-hover text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200"
              aria-label="Add donation"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
