
import { Clock, Package, Check, X } from "lucide-react";
import { Donation, categoryDisplayNames } from "@/types/receiverDashboard";
import { StatusBadge } from "./StatusBadge";
import { formatDate, formatTimeRemaining } from "@/utils/dateUtils";

interface DonationItemProps {
  donation: Donation;
  onAction: (donationId: number, action: 'received' | 'rejected') => void;
}

export const DonationItem = ({ donation, onAction }: DonationItemProps) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'clothes':
        return <Package className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getCategoryDisplay = (category: string) => {
    return categoryDisplayNames[category] || category;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-grow">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {donation.item_name}
            </h3>
            <StatusBadge status={donation.status} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600 space-x-4">
                <span className="flex items-center">
                  {getCategoryIcon(donation.category)}
                  <span className="ml-1">{getCategoryDisplay(donation.category)}</span>
                </span>
                <span>Quantity: {donation.quantity}</span>
              </div>
              
              {donation.description && (
                <p className="text-sm text-gray-600">{donation.description}</p>
              )}
              
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                {formatDate(donation.created_at)}
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Location:</span> {donation.location}</p>
              
              {donation.category === 'food' && donation.expiry_time && (
                <div className="mt-2">
                  <div className="flex items-center text-sm font-medium">
                    <Clock className="w-4 h-4 text-amber-500 mr-1" />
                    <span className="text-amber-700">
                      Freshness timer: {formatTimeRemaining(donation.expiry_time) || 'Expired'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This food item will remain fresh until {new Date(donation.expiry_time).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {donation.status === 'pending' && (
          <div className="flex space-x-2 ml-4">
            <button 
              onClick={() => onAction(donation.id, 'received')}
              className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
              title="Accept donation"
            >
              <Check className="w-5 h-5" />
            </button>
            <button 
              onClick={() => onAction(donation.id, 'rejected')}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Reject donation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
