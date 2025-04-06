
import { Clock, Package, Check, X, Image as ImageIcon, Maximize, User, Flag } from "lucide-react";
import { Donation, categoryDisplayNames } from "@/types/receiverDashboard";
import { StatusBadge } from "./StatusBadge";
import { formatDate, formatTimeRemaining } from "@/utils/dateUtils";
import { useEffect, useState } from "react";
import { ImageGallery } from "./ImageGallery";
import { UserContactInfo } from "@/components/UserContactInfo";
import { ReportUserDialog } from "@/components/ReportUserDialog";
import { useAuth } from "@/context/AuthContext";

interface DonationItemProps {
  donation: Donation;
  onAction: (donationId: number, action: 'received' | 'rejected') => void;
}

export const DonationItem = ({ donation, onAction }: DonationItemProps) => {
  const { user } = useAuth();
  const [timeRemaining, setTimeRemaining] = useState<string | null>(
    formatTimeRemaining(donation.expiry_time)
  );
  
  const [isExpired, setIsExpired] = useState<boolean>(
    donation.expiry_time ? new Date(donation.expiry_time) <= new Date() : false
  );
  
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showDonorInfo, setShowDonorInfo] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const hasImages = donation.images && donation.images.length > 0;

  useEffect(() => {
    if (donation.category === 'food' && donation.expiry_time) {
      const interval = setInterval(() => {
        const remaining = formatTimeRemaining(donation.expiry_time);
        setTimeRemaining(remaining);
        setIsExpired(new Date(donation.expiry_time) <= new Date());
      }, 1000);
      
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

  const openGallery = (index: number) => {
    setSelectedImageIndex(index);
    setShowGallery(true);
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
                    <Clock className={`w-4 h-4 mr-1 ${isExpired ? 'text-red-500' : 'text-amber-500'}`} />
                    <span className={isExpired ? 'text-red-700' : 'text-amber-700'}>
                      {isExpired ? 'Expired' : `Freshness timer: ${timeRemaining}`}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This food item {isExpired ? 'was' : 'will be'} fresh until {new Date(donation.expiry_time).toLocaleString()}
                  </p>
                </div>
              )}
              
              {donation.status === 'received' && donation.donor && (
                <div className="mt-3">
                  <button
                    onClick={() => setShowDonorInfo(!showDonorInfo)}
                    className="flex items-center text-blue-600 hover:underline"
                  >
                    <User className="w-4 h-4 mr-1" />
                    {showDonorInfo ? 'Hide' : 'Show'} donor information
                  </button>
                  
                  {showDonorInfo && (
                    <div className="mt-2">
                      <UserContactInfo user={donation.donor} title="Donor" />
                      {user && donation.donor.id !== user.id && (
                        <button
                          onClick={() => setShowReportDialog(true)}
                          className="mt-2 flex items-center text-red-600 hover:underline text-xs"
                        >
                          <Flag className="w-3 h-3 mr-1" />
                          Report this donor
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {hasImages ? (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Images</h4>
              <div className="grid grid-cols-3 gap-3">
                {donation.images.map((url, index) => (
                  <div 
                    key={index} 
                    className="relative h-24 border rounded cursor-pointer overflow-hidden group"
                    onClick={() => openGallery(index)}
                  >
                    <img 
                      src={url} 
                      alt={`${donation.item_name} ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Maximize className="w-5 h-5 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 py-2 px-3 bg-gray-50 rounded text-sm text-gray-500 flex items-center">
              <ImageIcon className="w-4 h-4 mr-2 text-gray-400" />
              No images available for this donation
            </div>
          )}
        </div>

        {donation.status === 'pending' && (
          <div className="ml-4">
            {donation.category === 'food' && isExpired ? (
              <div className="text-xs text-red-600 font-medium">
                Cannot accept expired food
              </div>
            ) : (
              <button 
                onClick={() => onAction(donation.id, 'received')}
                className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                title="Accept donation"
              >
                <Check className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
      
      {hasImages && (
        <ImageGallery 
          images={donation.images}
          isOpen={showGallery}
          onClose={() => setShowGallery(false)}
          initialIndex={selectedImageIndex}
          itemName={donation.item_name}
        />
      )}

      {donation.donor && user && (
        <ReportUserDialog
          isOpen={showReportDialog}
          onOpenChange={setShowReportDialog}
          reportedUserId={donation.donor.id}
          reportedUserName={`${donation.donor.first_name || ''} ${donation.donor.last_name || ''}`.trim() || 'this donor'}
          reporterUserId={user.id}
        />
      )}
    </div>
  );
};
