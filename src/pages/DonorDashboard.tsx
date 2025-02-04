
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DonorDashboard = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 relative">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Donations</h1>
      
      <div className="grid gap-4">
        {/* Donations will be listed here */}
        <p className="text-gray-600 text-center py-8">No donations yet. Click the + button to add your first donation.</p>
      </div>

      <button
        onClick={() => navigate("/add-donation")}
        className="fixed bottom-6 right-6 w-14 h-14 bg-donor-primary hover:bg-donor-hover text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200"
        aria-label="Add donation"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default DonorDashboard;
