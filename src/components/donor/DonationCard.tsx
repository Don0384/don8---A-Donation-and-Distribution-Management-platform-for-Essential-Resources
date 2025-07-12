
import { useState } from "react";
import { Clock, Trash, User, Flag, Image as ImageIcon } from "lucide-react";
import { formatTimeRemaining } from "@/utils/dateUtils";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { UserContactInfo } from "@/components/UserContactInfo";
import { ReportUserDialog } from "@/components/ReportUserDialog";
import { DonationConfirmDialog } from "@/components/donations/DonationConfirmDialog";
import { ImageGallery } from "@/components/receiver/ImageGallery";
import { PickupRequestSelector } from "@/components/donor/PickupRequestSelector";

interface DonationProps {
  id: number;
  itemName: string;
  quantity: string;
  category: string;
  status: string;
  createdAt: string;
  description?: string;
  expiryTime?: string | null;
  timeRemaining?: string | null;
  receiver?: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
  } | null;
  pickupRequests?: Array<{
    user_id: string;
    pickup_time: string;
    created_at: string;
  }>;
  images?: string[];
  onDelete?: (id: number) => void;
  onRecipientSelected?: () => void;
}

export default function DonationCard({
  id,
  itemName,
  quantity,
  category,
  status,
  createdAt,
  description,
  expiryTime,
  timeRemaining,
  receiver,
  pickupRequests = [],
  images = [],
  onDelete,
  onRecipientSelected
}: DonationProps) {
  const { user } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReceiverInfo, setShowReceiverInfo] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [initialImageIndex, setInitialImageIndex] = useState(0);
  const [showRecipientSelector, setShowRecipientSelector] = useState(false);
  
  const canDelete = status === "pending";
  
  const formattedDate = new Date(createdAt).toLocaleDateString();
  
  const sortedRequests = [...pickupRequests].sort((a, b) => 
    new Date(a.pickup_time).getTime() - new Date(b.pickup_time).getTime()
  );
  
  const getStatusColor = () => {
    switch (status) {
      case "received":
        return "text-green-600 bg-green-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      default:
        return "text-amber-600 bg-amber-100";
    }
  };
  
  const getCategoryEmoji = () => {
    switch (category) {
      case "food":
        return "🍲";
      case "clothes":
        return "👕";
      case "furniture":
        return "🪑";
      case "electronics":
        return "📱";
      case "books":
        return "📚";
      case "toys":
        return "🧸";
      default:
        return "📦";
    }
  };

  const openGallery = (index: number = 0) => {
    if (images && images.length > 0) {
      setInitialImageIndex(index);
      setShowGallery(true);
    }
  };

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">{itemName}</CardTitle>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {getCategoryEmoji()} {category.charAt(0).toUpperCase() + category.slice(1)} • {quantity}
        </p>
      </CardHeader>
      
      <CardContent className="pb-2">
        {description && (
          <p className="text-sm text-gray-600 mb-3">{description}</p>
        )}
        
        <div className="text-xs text-gray-500 flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          <span>Added on {formattedDate}</span>
        </div>
        
        {expiryTime && category === "food" && (
          <div className="mt-2 text-sm">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-amber-500" />
              <span className="text-amber-700">
                {timeRemaining ? `Fresh for: ${timeRemaining}` : "Expired"}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Expires on {new Date(expiryTime).toLocaleString()}
            </p>
          </div>
        )}
        
        {/* Display images section */}
        {images && images.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">Images</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-blue-600"
                onClick={() => openGallery()}
              >
                View all
              </Button>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {images.slice(0, 3).map((url, index) => (
                <div 
                  key={index} 
                  onClick={() => openGallery(index)} 
                  className="cursor-pointer h-16 overflow-hidden rounded border border-gray-200 relative group"
                >
                  <img 
                    src={url} 
                    alt={`${itemName} ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                </div>
              ))}
              {images.length > 3 && (
                <div className="flex items-center justify-center text-xs text-gray-500 cursor-pointer h-16 bg-gray-50 rounded border border-gray-200" onClick={() => openGallery(3)}>
                  +{images.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}
        
        {status === "received" && receiver && (
          <div className="mt-3">
            <button
              onClick={() => setShowReceiverInfo(!showReceiverInfo)}
              className="flex items-center text-blue-600 hover:underline text-sm"
            >
              <User className="w-4 h-4 mr-1" />
              {showReceiverInfo ? "Hide" : "Show"} recipient information
            </button>
            
            {showReceiverInfo && (
              <div className="mt-2">
                <UserContactInfo user={receiver} title="Recipient" />
                {user && receiver.id !== user.id && (
                  <button
                    onClick={() => setShowReportDialog(true)}
                    className="mt-2 flex items-center text-red-600 hover:underline text-xs"
                  >
                    <Flag className="w-3 h-3 mr-1" />
                    Report this recipient
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        
        {status === "pending" && sortedRequests.length > 0 && (
          <div className="mt-3 border-t border-gray-100 pt-3">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Pickup Requests ({sortedRequests.length})</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRecipientSelector(true)}
                className="text-primary hover:text-primary-foreground"
              >
                <User className="h-3.5 w-3.5 mr-1" />
                Select Recipient
              </Button>
            </div>
            <div className="space-y-2">
              {sortedRequests.map((request, idx) => (
                <div key={idx} className="text-xs p-2 bg-gray-50 rounded">
                  <div className="flex justify-between">
                    <span className="font-medium">Recipient #{idx + 1}</span>
                    <span className="text-green-600">
                      {new Date(request.pickup_time).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-500 mt-1">
                    Can pick up at the time shown above
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2">
        {canDelete && onDelete && (
          <Button 
            variant="outline" 
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash className="h-3.5 w-3.5 mr-2" />
            Remove
          </Button>
        )}
      </CardFooter>
      
      {onDelete && (
        <DonationConfirmDialog
          isOpen={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          onConfirm={() => {
            onDelete(id);
            setShowDeleteConfirm(false);
          }}
          title="Remove Donation"
          description="Are you sure you want to remove this donation? This action cannot be undone."
          confirmText="Remove"
          confirmVariant="destructive"
        />
      )}
      
      {receiver && user && (
        <ReportUserDialog
          isOpen={showReportDialog}
          onOpenChange={setShowReportDialog}
          reportedUserId={receiver.id}
          reportedUserName={`${receiver.first_name || ''} ${receiver.last_name || ''}`.trim() || 'this recipient'}
          reporterUserId={user.id}
        />
      )}

      {/* Image gallery modal */}
      {images && images.length > 0 && (
        <ImageGallery
          images={images}
          isOpen={showGallery}
          onClose={() => setShowGallery(false)}
          initialIndex={initialImageIndex}
          itemName={itemName}
        />
      )}

      {/* Recipient selector dialog */}
      <PickupRequestSelector
        donationId={id}
        donationTitle={itemName}
        isOpen={showRecipientSelector}
        onClose={() => setShowRecipientSelector(false)}
        onSuccess={() => {
          onRecipientSelected?.();
        }}
      />
    </Card>
  );
}
