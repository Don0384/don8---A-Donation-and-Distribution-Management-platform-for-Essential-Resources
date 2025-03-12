
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
import { Clock } from "lucide-react";
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

  const handleConfirm = () => {
    onConfirm(isFood ? expiryTime : undefined);
  };

  const validateTimeInput = (value: string) => {
    // Regular expression to validate HH:MM:SS format (24-hour)
    const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;
    if (timeRegex.test(value)) {
      setExpiryTime(value);
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
          <div className="flex items-center space-x-2 my-4">
            <Clock className="h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="HH:MM:SS"
              value={expiryTime}
              onChange={(e) => validateTimeInput(e.target.value)}
              className="w-32"
              required
            />
            <span className="text-sm text-gray-500">Set expiry time (24h format)</span>
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
