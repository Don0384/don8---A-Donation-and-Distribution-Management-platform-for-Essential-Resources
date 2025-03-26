
import { Clock, Package, Plus, Loader2, Inbox } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { formatDate, formatTimeRemaining } from "@/utils/dateUtils";

type Donation = {
  id: number;
  item_name: string;
  quantity: string;
  category: string;
  status: string;
  created_at: string;
  description: string | null;
  location: string;
  expiry_time: string | null;
};

const DonorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemainingMap, setTimeRemainingMap] = useState<Record<number, string | null>>({});
  
  // Fetch donations
  useEffect(() => {
    if (!user) return;

    async function fetchDonations() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('donations')
          .select('*')
          .eq('donor_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setDonations(data || []);
        
        // Initialize time remaining for food items
        const initialTimeMap: Record<number, string | null> = {};
        data?.forEach(donation => {
          if (donation.category === 'food' && donation.expiry_time) {
            initialTimeMap[donation.id] = formatTimeRemaining(donation.expiry_time);
          }
        });
        setTimeRemainingMap(initialTimeMap);
      } catch (err: any) {
        console.error('Error fetching donations:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDonations();
  }, [user]);
  
  // Update timers for food items with expiry time
  useEffect(() => {
    const foodDonations = donations.filter(d => d.category === 'food' && d.expiry_time);
    if (foodDonations.length === 0) return;
    
    const interval = setInterval(() => {
      const updatedTimeMap: Record<number, string | null> = {};
      
      foodDonations.forEach(donation => {
        updatedTimeMap[donation.id] = formatTimeRemaining(donation.expiry_time);
      });
      
      setTimeRemainingMap(prev => ({...prev, ...updatedTimeMap}));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [donations]);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'received':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'clothes':
        return <Package className="w-4 h-4" />;
      // Add more category icons as needed
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <Navbar />
      <div className="flex-1 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Donations</h1>
            
            <button
              onClick={() => navigate("/donor/inbox")}
              className="bg-donor-primary hover:bg-donor-hover text-white p-2 rounded-full flex items-center justify-center shadow-sm transition-colors"
              aria-label="View inbox"
            >
              <Inbox className="w-5 h-5" />
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 text-blue-500 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {donations.length > 0 ? (
                donations.map((donation) => (
                  <div 
                    key={donation.id}
                    className="bg-white rounded-lg shadow-sm p-6 transition-all hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {donation.item_name}
                          </h3>
                          <Badge 
                            className={`${getStatusColor(donation.status)} capitalize`}
                          >
                            {donation.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600 space-x-4">
                            <span className="flex items-center">
                              {getCategoryIcon(donation.category)}
                              <span className="ml-1 capitalize">{donation.category}</span>
                            </span>
                            <span>Quantity: {donation.quantity}</span>
                          </div>
                          
                          {donation.description && (
                            <p className="text-sm text-gray-600">{donation.description}</p>
                          )}
                          
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Location:</span> {donation.location}
                          </p>
                          
                          {donation.category === 'food' && donation.expiry_time && (
                            <div className="mt-2">
                              <div className="flex items-center text-sm font-medium">
                                <Clock className="w-4 h-4 text-amber-500 mr-1" />
                                <span className="text-amber-700">
                                  Freshness timer: {timeRemainingMap[donation.id] || 'Expired'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                This food item will remain fresh until {new Date(donation.expiry_time).toLocaleString()}
                              </p>
                            </div>
                          )}
                          
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatDate(donation.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-8">
                  No donations yet. Click the + button to add your first donation.
                </p>
              )}
            </div>
          )}

          <button
            onClick={() => navigate("/add-donation")}
            className="fixed bottom-6 right-6 w-14 h-14 bg-donor-primary hover:bg-donor-hover text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200"
            aria-label="Add donation"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
