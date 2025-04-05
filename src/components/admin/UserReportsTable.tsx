
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Report } from "@/types/donations";

const UserReportsTable = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      setLoading(true);

      // Use type assertion for proper TypeScript compatibility
      const { data, error } = await supabase
        .from('user_reports')
        .select(`
          *,
          reported_user:reported_user_id(
            email:email,
            first_name:raw_user_meta_data->first_name,
            last_name:raw_user_meta_data->last_name
          ),
          reporter_user:reporter_user_id(
            email:email,
            first_name:raw_user_meta_data->first_name,
            last_name:raw_user_meta_data->last_name
          )
        `) as any;
      
      if (error) throw error;
      
      // Convert data to our Report type
      const typedReports = data ? data.map((report: any) => ({
        id: report.id,
        reported_user_id: report.reported_user_id,
        reporter_user_id: report.reporter_user_id,
        reason: report.reason,
        status: report.status,
        created_at: report.created_at,
        reported_user: report.reported_user,
        reporter_user: report.reporter_user
      })) : [];
      
      setReports(typedReports);
    } catch (err: any) {
      console.error("Error fetching reports:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchReports();
  }, []);

  const updateReportStatus = async (reportId: number, status: "approved" | "rejected") => {
    try {
      // Use type assertion to handle the user_reports table
      const { error } = await supabase
        .from('user_reports')
        .update({ status })
        .eq('id', reportId) as any;
      
      if (error) throw error;
      
      toast({
        title: `Report ${status}`,
        description: `The report has been ${status} successfully.`,
      });
      
      setReports(reports.map(report => 
        report.id === reportId ? { ...report, status } : report
      ));
    } catch (err: any) {
      console.error("Error updating report status:", err);
      toast({
        title: "Error",
        description: err.message || "An error occurred while updating the report status.",
        variant: "destructive",
      });
    }
  };

  const banUser = async (userId: string) => {
    try {
      // Use type assertion to handle the user_reports table
      const { error } = await supabase
        .from('user_reports')
        .update({ status: "banned" })
        .eq('reported_user_id', userId) as any;
      
      if (error) throw error;
      
      toast({
        title: "User banned",
        description: "The user has been banned successfully.",
      });
      
      // Refresh reports to show updated statuses
      fetchReports();
    } catch (err: any) {
      console.error("Error banning user:", err);
      toast({
        title: "Error",
        description: err.message || "An error occurred while banning the user.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No user reports found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Reported User</TableHead>
            <TableHead>Reporter</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="whitespace-nowrap">
                {new Date(report.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {report.reported_user ? (
                  <div>
                    <div className="font-medium">
                      {report.reported_user.first_name} {report.reported_user.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{report.reported_user.email}</div>
                  </div>
                ) : (
                  <span className="text-gray-500">Unknown user</span>
                )}
              </TableCell>
              <TableCell>
                {report.reporter_user ? (
                  <div>
                    <div className="font-medium">
                      {report.reporter_user.first_name} {report.reporter_user.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{report.reporter_user.email}</div>
                  </div>
                ) : (
                  <span className="text-gray-500">Unknown user</span>
                )}
              </TableCell>
              <TableCell className="max-w-xs">
                <div className="truncate">{report.reason}</div>
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 text-xs font-medium rounded-full 
                  ${report.status === 'approved' ? 'bg-green-100 text-green-800' : 
                    report.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                    report.status === 'banned' ? 'bg-purple-100 text-purple-800' :
                    'bg-yellow-100 text-yellow-800'}`}>
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </span>
              </TableCell>
              <TableCell>
                {report.status === 'pending' && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-500 text-green-600 hover:bg-green-50"
                      onClick={() => updateReportStatus(report.id, 'approved')}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50"
                      onClick={() => updateReportStatus(report.id, 'rejected')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-purple-500 text-purple-600 hover:bg-purple-50"
                      onClick={() => banUser(report.reported_user_id)}
                    >
                      Ban User
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserReportsTable;
