
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { DonationsList } from "@/components/donor/DonationsList";
import { DashboardHeader } from "@/components/donor/DashboardHeader";
import { useDonorDonations } from "@/hooks/useDonorDonations";
import { useNotifications } from "@/hooks/useNotifications";

const DonorDashboard = () => {
  const navigate = useNavigate();
  const { donations, isLoading, error, timeRemainingMap, fetchDonations } = useDonorDonations();
  const { unreadMessageCount } = useNotifications("donor");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchDonations();
      } finally {
        // Delay removing the loading state to prevent flickering
        setTimeout(() => {
          setIsInitialLoad(false);
        }, 300);
      }
    };
    
    loadData();
  }, [fetchDonations]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <Navbar />
      <div className="flex-1 p-4">
        <div className="max-w-6xl mx-auto">
          <DashboardHeader 
            title="My Donations" 
            unreadMessageCount={unreadMessageCount}
          />
          
          <DonationsList 
            donations={donations}
            isLoading={isLoading || isInitialLoad}
            error={error}
            timeRemainingMap={timeRemainingMap}
            onRecipientSelected={fetchDonations}
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
