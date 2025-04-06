
import { Clock, MapPin, Package, Image as ImageIcon } from "lucide-react";
import { Donation, categoryDisplayNames } from "@/types/receiverDashboard";
import { formatDate, formatTimeRemaining } from "@/utils/dateUtils";
import { useEffect, useState } from "react";

interface DonationCardProps {
  donation: Donation;
  onOpen: () => void;
}

export const DonationCard = ({ donation, onOpen }: DonationCardProps) => {
  const [timeRemaining, setTimeRemaining] = useState<string | null>(
    donation.expiry_time ? formatTimeRemaining(donation.expiry_time) : null
  );
  
  const [isExpired, setIsExpired] = useState<boolean>(
    donation.expiry_time ? new Date(donation.expiry_time) <= new Date() : false
  );
  
  useEffect(() => {
    if (donation.category === 'food' && donation.expiry_time) {
      const interval = setInterval(() => {
        const remaining = formatTimeRemaining(donation.expiry_time);
        setTimeRemaining(remaining);
        setIsExpired(new Date(donation.expiry_time) <= new Date());
      }, 60000); // Update once per minute instead of every second
      
      return () => clearInterval(interval);
    }
  }, [donation.expiry_time, donation.category]);

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

  // Make sure images is always an array, even if it's null or undefined
  const images = Array.isArray(donation.images) ? donation.images : [];
  const hasImages = images.length > 0;

  // Determine if this donation can be accepted
  const isAcceptable = !(donation.category === 'food' && isExpired);

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm p-4 ${isAcceptable ? 'cursor-pointer hover:shadow-md' : 'opacity-75'} transition-shadow`}
      onClick={() => isAcceptable ? onOpen() : null}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {donation.item_name}
      </h3>
      
      <div className="space-y-2 mb-3">
        <div className="flex items-center text-sm text-gray-600">
          {getCategoryIcon(donation.category)}
          <span className="ml-1">{getCategoryDisplay(donation.category)}</span>
        </div>
        
        {donation.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{donation.description}</p>
        )}
        
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{donation.location}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-1" />
          <span>{formatDate(donation.created_at)}</span>
        </div>
      </div>
      
      {donation.category === 'food' && donation.expiry_time && (
        <div className="mt-2 text-xs font-medium border-t pt-2">
          <div className="flex items-center">
            <Clock className={`w-3 h-3 mr-1 ${isExpired ? 'text-red-500' : 'text-amber-500'}`} />
            <span className={isExpired ? 'text-red-600' : 'text-amber-600'}>
              {isExpired ? 'Expired' : `Fresh for: ${timeRemaining}`}
            </span>
          </div>
          {isExpired && (
            <p className="text-xs text-red-500 mt-1">
              This food item has expired and cannot be accepted
            </p>
          )}
        </div>
      )}
      
      {hasImages ? (
        <div className="mt-3 flex">
          <div className="w-16 h-16 rounded overflow-hidden">
            <img 
              src={images[0]} 
              alt={donation.item_name} 
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <div className="text-xs text-white bg-gray-800 bg-opacity-70 text-center -mt-5 relative">
                +{images.length - 1} more
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-3 flex items-center text-xs text-gray-400">
          <ImageIcon className="w-3 h-3 mr-1" />
          <span>No images available</span>
        </div>
      )}
    </div>
  );
};
