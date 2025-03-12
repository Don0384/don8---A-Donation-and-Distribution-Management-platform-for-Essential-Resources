
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Clock, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface DonationConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (expiryTime?: string) => void;
  itemName: string;
  isFood: boolean;
}

export function DonationConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  isFood,
}: DonationConfirmDialogProps) {
  const [expiryTime, setExpiryTime] = useState("");
  const [timeError, setTimeError] = useState<string | null>(null);

  const handleConfirm = () => {
    if (isFood && !expiryTime) {
      setTimeError("Please set an expiry time for food donations");
      return;
    }
    onConfirm(isFood ? expiryTime : undefined);
  };

  const validateTimeInput = (value: string) => {
    // Regular expression to validate HH:MM:SS format (24-hour)
    const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;
    
    if (value === "") {
      setExpiryTime("");
      setTimeError(null);
      return;
    }
    
    if (timeRegex.test(value)) {
      setExpiryTime(value);
      setTimeError(null);
    } else {
      setTimeError("Please use the format HH:MM:SS (e.g., 02:30:00)");
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Donation</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to donate {itemName}?
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isFood && (
          <div className="flex flex-col space-y-2 my-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Set expiry time (24h format)</span>
            </div>
            
            <div className="flex flex-col space-y-1">
              <Input
                type="text"
                placeholder="HH:MM:SS"
                value={expiryTime}
                onChange={(e) => validateTimeInput(e.target.value)}
                className={`w-full ${timeError ? 'border-red-500' : ''}`}
                required={isFood}
              />
              
              {timeError && (
                <div className="flex items-center space-x-1 text-xs text-red-500">
                  <AlertTriangle className="h-3 w-3" />
                  <span>{timeError}</span>
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                This sets how long the food will remain fresh after pickup.
              </p>
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
