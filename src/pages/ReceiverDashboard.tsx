
import { Clock, Package, Check, X, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

// Mock data for demonstration
const mockDonations = [
  {
    id: 1,
    donorName: "John Doe",
    itemName: "Winter Jackets",
    quantity: "5 pieces",
    category: "Clothing",
    status: "pending",
    createdAt: "2024-03-10T10:00:00",
    location: "123 Main St, City",
    recipientOrg: "Local Shelter"
  },
  {
    id: 2,
    donorName: "Jane Smith",
    itemName: "Fresh Vegetables",
    quantity: "20 kg",
    category: "Food - Veg",
    status: "received",
    createdAt: "2024-03-09T15:30:00",
    location: "456 Oak Ave, Town",
    recipientOrg: "Food Bank"
  },
  {
    id: 3,
    donorName: "Mike Johnson",
    itemName: "First Aid Kits",
    quantity: "10 kits",
    category: "Medical Equipment",
    status: "pending",
    createdAt: "2024-03-11T09:15:00",
    location: "789 Pine Rd, Village",
    recipientOrg: "Medical Center"
  }
];

const categories = [
  "All",
  "Food - Veg",
  "Food - Non-Veg",
  "Clothing",
  "Electronics",
  "Medical Equipment",
  "Medicine"
];

const ReceiverDashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
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
      case 'Clothing':
        return <Package className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const handleStatusChange = (donationId: number, newStatus: 'received' | 'rejected') => {
    // In a real app, this would make an API call
    toast({
      title: `Donation ${newStatus}`,
      description: `The donation has been ${newStatus} successfully.`,
      variant: newStatus === 'received' ? 'default' : 'destructive',
    });
  };

  const filteredDonations = mockDonations.filter(donation => 
    selectedCategory === "All" || donation.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Available Donations</h1>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid gap-4">
          {filteredDonations.length > 0 ? (
            filteredDonations.map((donation) => (
              <div 
                key={donation.id}
                className="bg-white rounded-lg shadow-sm p-6 transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-grow">
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
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600 space-x-4">
                          <span className="flex items-center">
                            {getCategoryIcon(donation.category)}
                            <span className="ml-1">{donation.category}</span>
                          </span>
                          <span>Quantity: {donation.quantity}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDate(donation.createdAt)}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <p><span className="font-medium">Donor:</span> {donation.donorName}</p>
                        <p><span className="font-medium">Location:</span> {donation.location}</p>
                        <p><span className="font-medium">Recipient:</span> {donation.recipientOrg}</p>
                      </div>
                    </div>
                  </div>

                  {donation.status === 'pending' && (
                    <div className="flex space-x-2 ml-4">
                      <button 
                        onClick={() => handleStatusChange(donation.id, 'received')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                        title="Accept donation"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleStatusChange(donation.id, 'rejected')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Reject donation"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-center py-8">
              No donations available in this category.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiverDashboard;
