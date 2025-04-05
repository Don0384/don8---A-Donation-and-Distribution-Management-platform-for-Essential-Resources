
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface PickupTimeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (pickupTime: string) => Promise<void>;
  itemName: string;
}

export function PickupTimeDialog({ isOpen, onOpenChange, onConfirm, itemName }: PickupTimeDialogProps) {
  const [pickupTime, setPickupTime] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Calculate default time (current time + 1 hour, rounded to nearest 15 min)
  const getDefaultPickupTime = (): string => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15);
    now.setSeconds(0);
    return now.toISOString().slice(0, 16); // Format: "YYYY-MM-DDTHH:MM"
  };
  
  // Set default pickup time when dialog opens
  useEffect(() => {
    if (isOpen) {
      setPickupTime(getDefaultPickupTime());
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!pickupTime) return;
    
    setIsSubmitting(true);
    try {
      await onConfirm(pickupTime);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting pickup time:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>When can you pick up this donation?</DialogTitle>
          <DialogDescription>
            Please select the earliest time you can pick up "{itemName}". Donors may prioritize recipients who can pick up sooner.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pickup-time" className="text-right">
              Pickup Time
            </Label>
            <Input
              id="pickup-time"
              type="datetime-local"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="col-span-3"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !pickupTime}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
