
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReportUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reportedUserId: string;
  reporterUserId: string;
  reportedUserName: string;
}

export const ReportUserDialog = ({
  isOpen,
  onOpenChange,
  reportedUserId,
  reporterUserId,
  reportedUserName
}: ReportUserDialogProps) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for the report.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Use type assertion to handle the user_reports table
      const { error } = await supabase
        .from('user_reports')
        .insert({
          reported_user_id: reportedUserId,
          reporter_user_id: reporterUserId,
          reason: reason.trim(),
          status: 'pending'
        } as any);
        
      if (error) throw error;
      
      toast({
        title: "Report submitted",
        description: "Your report has been submitted and will be reviewed by our team.",
      });
      
      onOpenChange(false);
      setReason("");
    } catch (error: any) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error",
        description: "An error occurred while submitting the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report {reportedUserName}</DialogTitle>
          <DialogDescription>
            Please provide details about why you are reporting this user. Our admin team will review your report.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            placeholder="Describe the issue or reason for reporting..."
            className="min-h-[120px]"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
