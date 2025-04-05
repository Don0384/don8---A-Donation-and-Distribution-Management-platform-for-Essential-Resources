
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Report } from "@/types/donations";

const UserReportsTable = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('user_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      // Enhance reports with user profiles
      const enhancedReports = await Promise.all(reportsData.map(async (report) => {
        // Get reported user profile
        const { data: reportedUserData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', report.reported_user_id)
          .single();

        // Get reporter user profile
        const { data: reporterUserData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', report.reporter_user_id)
          .single();

        return {
          ...report,
          reported_user: reportedUserData || null,
          reporter_user: reporterUserData || null
        } as Report;
      }));

      setReports(enhancedReports);
    } catch (err: any) {
      console.error('Error fetching reports:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (reportId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('user_reports')
        .update({ status: newStatus })
        .eq('id', reportId);

      if (error) throw error;

      // Update local state
      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId ? { ...report, status: newStatus } : report
        )
      );

      toast({
        title: "Status updated",
        description: `Report status has been updated to ${newStatus}.`,
      });
    } catch (err: any) {
      console.error('Error updating report status:', err);
      toast({
        title: "Error",
        description: "Failed to update report status.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (reportId: number) => {
    try {
      const { error } = await supabase
        .from('user_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      // Update local state
      setReports((prev) => prev.filter((report) => report.id !== reportId));

      toast({
        title: "Report deleted",
        description: "The report has been permanently deleted.",
      });
    } catch (err: any) {
      console.error('Error deleting report:', err);
      toast({
        title: "Error",
        description: "Failed to delete report.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading reports...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported User</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No reports found
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {report.reported_user ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {report.reported_user.first_name} {report.reported_user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{report.reported_user.username}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Unknown user</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {report.reporter_user ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {report.reporter_user.first_name} {report.reporter_user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{report.reporter_user.username}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Unknown user</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.reason}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${report.status === 'resolved' ? 'bg-green-100 text-green-800' : 
                        report.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(report.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      {report.status === 'pending' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-green-400 text-green-600 hover:bg-green-50"
                            onClick={() => handleStatusChange(report.id, 'resolved')}
                          >
                            Resolve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-red-400 text-red-600 hover:bg-red-50"
                            onClick={() => handleStatusChange(report.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => handleDelete(report.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserReportsTable;
