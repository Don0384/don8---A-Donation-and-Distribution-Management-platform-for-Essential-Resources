
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Ban, Check, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Report {
  id: number;
  reported_user_id: string;
  reporter_user_id: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  reported_user: {
    email: string;
    first_name: string | null;
    last_name: string | null;
    user_type: string;
  } | null;
  reporter_user: {
    email: string;
    first_name: string | null;
    last_name: string | null;
    user_type: string;
  } | null;
}

export function UserReportsTable() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionType, setActionType] = useState<'resolve' | 'dismiss' | 'ban' | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchReports();
  }, []);
  
  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // Get all reports with user details
      const { data, error } = await supabase
        .from('user_reports')
        .select(`
          *,
          reported_user:reported_user_id(
            email:email,
            first_name:raw_user_meta_data->first_name,
            last_name:raw_user_meta_data->last_name,
            user_type:raw_user_meta_data->user_type
          ),
          reporter_user:reporter_user_id(
            email:email,
            first_name:raw_user_meta_data->first_name,
            last_name:raw_user_meta_data->last_name,
            user_type:raw_user_meta_data->user_type
          )
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Error",
        description: "Failed to load user reports. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAction = (report: Report, action: 'resolve' | 'dismiss' | 'ban') => {
    setSelectedReport(report);
    setActionType(action);
    setIsConfirmDialogOpen(true);
  };
  
  const confirmAction = async () => {
    if (!selectedReport || !actionType) return;
    
    try {
      if (actionType === 'ban') {
        // First, update the report status
        const { error: reportError } = await supabase
          .from('user_reports')
          .update({ status: 'resolved' })
          .eq('id', selectedReport.id);
          
        if (reportError) throw reportError;
        
        // Then delete the user (would require admin privileges)
        // In real-world, this might flag the user as banned instead
        const { error: userError } = await supabase.auth.admin.deleteUser(
          selectedReport.reported_user_id
        );
        
        if (userError) throw userError;
        
        toast({
          title: "User banned",
          description: "The user has been banned and removed from the platform."
        });
      } else {
        // Just update the report status
        const { error } = await supabase
          .from('user_reports')
          .update({ status: actionType === 'resolve' ? 'resolved' : 'dismissed' })
          .eq('id', selectedReport.id);
          
        if (error) throw error;
        
        toast({
          title: actionType === 'resolve' ? "Report resolved" : "Report dismissed",
          description: actionType === 'resolve' 
            ? "The report has been marked as resolved." 
            : "The report has been dismissed."
        });
      }
      
      // Refresh the reports list
      fetchReports();
    } catch (error: any) {
      console.error(`Error during ${actionType} action:`, error);
      toast({
        title: "Action failed",
        description: error.message || `Failed to ${actionType} the report.`,
        variant: "destructive",
      });
    } finally {
      setIsConfirmDialogOpen(false);
      setSelectedReport(null);
      setActionType(null);
    }
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">User Reports</h2>
      
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex justify-between mb-3">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-12 w-full mb-3" />
              <div className="flex justify-end space-x-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-lg p-6 text-center">
          <p className="text-gray-500">No user reports found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div 
              key={report.id} 
              className={`bg-white p-4 rounded-lg border ${
                report.status === 'pending' 
                  ? 'border-amber-200 bg-amber-50' 
                  : report.status === 'resolved' 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">
                    Report against: <span className="text-red-600">
                      {report.reported_user?.first_name} {report.reported_user?.last_name} ({report.reported_user?.user_type})
                    </span>
                  </h3>
                  <p className="text-sm text-gray-500">
                    Reported by: {report.reporter_user?.first_name} {report.reporter_user?.last_name} ({report.reporter_user?.user_type})
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(report.created_at).toLocaleString()}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  report.status === 'pending' 
                    ? 'bg-amber-100 text-amber-800' 
                    : report.status === 'resolved' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                }`}>
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </span>
              </div>
              
              <div className="bg-gray-50 p-3 rounded my-2 text-sm">
                <p className="whitespace-pre-wrap">{report.reason}</p>
              </div>
              
              {report.status === 'pending' && (
                <div className="flex justify-end space-x-2 mt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleAction(report, 'dismiss')}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Dismiss
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-green-500 text-green-600 hover:bg-green-50"
                    onClick={() => handleAction(report, 'resolve')}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Resolve
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-red-500 text-red-600 hover:bg-red-50"
                    onClick={() => handleAction(report, 'ban')}
                  >
                    <Ban className="h-4 w-4 mr-1" />
                    Ban User
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'ban' 
                ? 'Ban User' 
                : actionType === 'resolve' 
                  ? 'Resolve Report' 
                  : 'Dismiss Report'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'ban' 
                ? 'This will permanently remove the user from the platform. This action cannot be undone.' 
                : actionType === 'resolve' 
                  ? 'This will mark the report as resolved. You can still ban the user later if needed.' 
                  : 'This will mark the report as dismissed.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={actionType === 'ban' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {actionType === 'ban' 
                ? 'Ban User' 
                : actionType === 'resolve' 
                  ? 'Resolve' 
                  : 'Dismiss'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
