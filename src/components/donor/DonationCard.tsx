
import { Package, Clock, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/dateUtils";
import { useState } from "react";
import { ImageGallery } from "@/components/receiver/ImageGallery";
import { Button } from "@/components/ui/button";

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
    images: string[] | null;
  };
  timeRemaining: string | null;
};

export const DonationCard = ({ donation, timeRemaining }: DonationCardProps) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [initialImageIndex, setInitialImageIndex] = useState(0);

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

  const openGallery = (index: number = 0) => {
    setInitialImageIndex(index);
    setIsGalleryOpen(true);
  };

  const hasImages = donation.images && donation.images.length > 0;

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

            {hasImages && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Images:</p>
                <div className="flex flex-wrap gap-2">
                  {donation.images.map((image, index) => (
                    <div 
                      key={index} 
                      className="w-16 h-16 rounded overflow-hidden cursor-pointer border border-gray-200 hover:opacity-90 transition-opacity"
                      onClick={() => openGallery(index)}
                    >
                      <img 
                        src={image} 
                        alt={`Image ${index + 1} of ${donation.item_name}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 text-xs flex items-center gap-1"
                  onClick={() => openGallery(0)}
                >
                  <ImageIcon className="w-4 h-4" />
                  View all images
                </Button>
              </div>
            )}
            
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {formatDate(donation.created_at)}
            </div>
          </div>
        </div>
      </div>

      {hasImages && (
        <ImageGallery
          images={donation.images}
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          initialIndex={initialImageIndex}
          itemName={donation.item_name}
        />
      )}
    </div>
  );
};
