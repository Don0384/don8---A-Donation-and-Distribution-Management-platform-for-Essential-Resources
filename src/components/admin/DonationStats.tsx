
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DonationWithProfiles } from "@/types/donations";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface DonationStatsProps {
  donations: DonationWithProfiles[];
}

const DonationStats = ({ donations }: DonationStatsProps) => {
  // Calculate statistics
  const stats = useMemo(() => {
    // Total donations count
    const totalDonations = donations.length;
    
    // Count by status
    const byStatus = donations.reduce((acc, donation) => {
      acc[donation.status] = (acc[donation.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const statusData = Object.entries(byStatus).map(([name, value]) => ({
      name,
      value
    }));
    
    // Count by category
    const byCategory = donations.reduce((acc, donation) => {
      acc[donation.category] = (acc[donation.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const categoryData = Object.entries(byCategory).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
    
    // Donors with donation counts
    const donorCounts = donations.reduce((acc, donation) => {
      if (donation.donor_id) {
        acc[donation.donor_id] = (acc[donation.donor_id] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const uniqueDonors = Object.keys(donorCounts).length;
    
    // Receivers with donation counts
    const receiverCounts = donations.reduce((acc, donation) => {
      if (donation.receiver_id) {
        acc[donation.receiver_id] = (acc[donation.receiver_id] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const uniqueReceivers = Object.keys(receiverCounts).length;
    
    return {
      totalDonations,
      uniqueDonors,
      uniqueReceivers,
      statusData,
      categoryData
    };
  }, [donations]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Donation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold">{stats.totalDonations}</p>
              <p className="text-sm text-muted-foreground">Total Donations</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.uniqueDonors}</p>
              <p className="text-sm text-muted-foreground">Unique Donors</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.uniqueReceivers}</p>
              <p className="text-sm text-muted-foreground">Unique Receivers</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Donations by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Donations by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.categoryData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonationStats;
