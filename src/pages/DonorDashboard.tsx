
import { Clock, Package, Plus, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

// Mock data for demonstration - in a real app this would come from your backend
const mockDonations = [
  {
    id: 1,
    donorName: "John Doe",
    itemName: "Winter Jackets",
    quantity: "5",
    category: "clothes",
    status: "pending",
    createdAt: "2024-03-10T10:00:00",
  },
  {
    id: 2,
    donorName: "Jane Smith",
    itemName: "Canned Food",
    quantity: "20",
    category: "food",
    status: "approved",
    createdAt: "2024-03-09T15:30:00",
  }
];

const DonorDashboard = () => {
  const navigate = useNavigate();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'clothes':
        return <Package className="w-4 h-4" />;
      // Add more category icons as needed
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 relative">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Donations</h1>
        
        <div className="grid gap-4">
          {mockDonations.length > 0 ? (
            mockDonations.map((donation) => (
              <div 
                key={donation.id}
                className="bg-white rounded-lg shadow-sm p-6 transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {donation.itemName}
                      </h3>
                      <Badge 
                        className={`${getStatusColor(donation.status)} capitalize`}
                      >
                        {donation.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600 space-x-4">
                        <span className="flex items-center">
                          {getCategoryIcon(donation.category)}
                          <span className="ml-1 capitalize">{donation.category}</span>
                        </span>
                        <span>Quantity: {donation.quantity}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDate(donation.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {donation.status === 'pending' && (
                      <>
                        <button 
                          className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                          title="Approve donation"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button 
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                          title="Reject donation"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-center py-8">
              No donations yet. Click the + button to add your first donation.
            </p>
          )}
        </div>

        <button
          onClick={() => navigate("/add-donation")}
          className="fixed bottom-6 right-6 w-14 h-14 bg-donor-primary hover:bg-donor-hover text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200"
          aria-label="Add donation"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default DonorDashboard;
