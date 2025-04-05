import { useState } from "react";
import { Clock, Trash, User, Flag } from "lucide-react";
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
  onDelete?: (id: number) => void;
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
  onDelete
}: DonationProps) {
  const { user } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReceiverInfo, setShowReceiverInfo] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  
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
            <h4 className="text-sm font-medium mb-2">Pickup Requests ({sortedRequests.length})</h4>
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
    </Card>
  );
}
