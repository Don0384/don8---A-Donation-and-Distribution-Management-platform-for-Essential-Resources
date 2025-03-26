
import { Package, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/dateUtils";

type DonationCardProps = {
  donation: {
    id: number;
    item_name: string;
    quantity: string;
    category: string;
    status: string;
    created_at: string;
    description: string | null;
    location: string;
    expiry_time: string | null;
  };
  timeRemaining: string | null;
};

export const DonationCard = ({ donation, timeRemaining }: DonationCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'received':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'clothes':
        return <Package className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {donation.item_name}
            </h3>
            <Badge className={`${getStatusColor(donation.status)} capitalize`}>
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
            
            {donation.description && (
              <p className="text-sm text-gray-600">{donation.description}</p>
            )}
            
            <p className="text-sm text-gray-600">
              <span className="font-medium">Location:</span> {donation.location}
            </p>
            
            {donation.category === 'food' && donation.expiry_time && (
              <div className="mt-2">
                <div className="flex items-center text-sm font-medium">
                  <Clock className="w-4 h-4 text-amber-500 mr-1" />
                  <span className="text-amber-700">
                    Freshness timer: {timeRemaining || 'Expired'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This food item will remain fresh until {new Date(donation.expiry_time).toLocaleString()}
                </p>
              </div>
            )}
            
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {formatDate(donation.created_at)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
