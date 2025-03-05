
import { Clock, Package, Check, X, Filter, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
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
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

type Donation = {
  id: number;
  donor_id: string;
  item_name: string;
  description: string | null;
  quantity: string;
  category: string;
  status: string;
  created_at: string;
  location: string;
  receiver_id: string | null;
};

const categories = [
  "All",
  "clothes",
  "food",
  "electronics",
  "medical_equipment",
  "medicine"
];

const statuses = [
  "All",
  "pending",
  "received",
  "rejected"
];

const categoryDisplayNames: Record<string, string> = {
  clothes: "Clothing",
  food: "Food",
  electronics: "Electronics",
  medical_equipment: "Medical Equipment", 
  medicine: "Medicine"
};

const ReceiverDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<{
    id: number;
    action: 'received' | 'rejected' | null;
  }>({ id: 0, action: null });
  
  // Fetch donations
  useEffect(() => {
    if (!user) return;
    
    async function fetchDonations() {
      try {
        setIsLoading(true);
        
        let query = supabase
          .from('donations')
          .select('*')
          .order('created_at', { ascending: false });
        
        // If we're not viewing "All" statuses, filter by status
        if (selectedStatus !== "All") {
          query = query.eq('status', selectedStatus);
        }
        
        // For received/rejected donations, only show those handled by this receiver
        if (selectedStatus === 'received' || selectedStatus === 'rejected') {
          query = query.eq('receiver_id', user.id);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        setDonations(data || []);
      } catch (err: any) {
        console.error('Error fetching donations:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDonations();
  }, [selectedStatus, user]);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'clothes':
        return <Package className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const openConfirmDialog = (donationId: number, action: 'received' | 'rejected') => {
    setSelectedDonation({ id: donationId, action });
    setDialogOpen(true);
  };

  const handleStatusChange = async () => {
    if (!selectedDonation.action || !user) return;
    
    try {
      console.log('Updating donation with ID:', selectedDonation.id);
      console.log('Setting status to:', selectedDonation.action);
      console.log('Current user ID:', user.id);
      
      // Update donation status in the database with explicit user auth
      const { error, data } = await supabase
        .from('donations')
        .update({ 
          status: selectedDonation.action,
          receiver_id: user.id
        })
        .eq('id', selectedDonation.id)
        .select();
      
      console.log('Update response:', { error, data });
      
      if (error) throw error;
      
      // Update local state - show the updated donation with new status if we're not filtering for just pending
      if (selectedStatus === 'All') {
        setDonations(prev => 
          prev.map(donation => 
            donation.id === selectedDonation.id
              ? { ...donation, status: selectedDonation.action as string, receiver_id: user.id }
              : donation
          )
        );
      } else if (selectedStatus === 'pending') {
        // If we're viewing only pending, remove this donation from the list
        setDonations(prev => 
          prev.filter(donation => donation.id !== selectedDonation.id)
        );
      }
      
      toast({
        title: `Donation ${selectedDonation.action}`,
        description: `The donation has been ${selectedDonation.action} successfully.`,
        variant: selectedDonation.action === 'received' ? 'default' : 'destructive',
      });
      
      // Fetch donations again to ensure UI is up to date
      if (selectedStatus === selectedDonation.action) {
        setTimeout(() => {
          fetchDonationsAfterStatusChange();
        }, 500);
      }
    } catch (err: any) {
      console.error('Error updating donation status:', err);
      toast({
        title: "Error",
        description: err.message || "An error occurred while updating the donation status.",
        variant: "destructive",
      });
    } finally {
      setDialogOpen(false);
      setSelectedDonation({ id: 0, action: null });
    }
  };

  // Helper function to fetch donations after a status change
  const fetchDonationsAfterStatusChange = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false });
      
      // If we're not viewing "All" statuses, filter by status
      if (selectedStatus !== "All") {
        query = query.eq('status', selectedStatus);
      }
      
      // For received/rejected donations, only show those handled by this receiver
      if (selectedStatus === 'received' || selectedStatus === 'rejected') {
        query = query.eq('receiver_id', user.id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setDonations(data || []);
    } catch (err: any) {
      console.error('Error fetching donations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDonations = donations.filter(donation => 
    (selectedCategory === "All" || donation.category === selectedCategory)
  );

  const getCategoryDisplay = (category: string) => {
    return categoryDisplayNames[category] || category;
  };

  const getStatusTitle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Available Donations';
      case 'received':
        return 'Accepted Donations';
      case 'rejected':
        return 'Rejected Donations';
      default:
        return 'All Donations';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {getStatusTitle(selectedStatus)}
            </h1>
            
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center gap-2">
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status === "All" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === "All" ? "All Categories" : getCategoryDisplay(category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
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
              {filteredDonations.length > 0 ? (
                filteredDonations.map((donation) => (
                  <div 
                    key={donation.id}
                    className="bg-white rounded-lg shadow-sm p-6 transition-all hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-grow">
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600 space-x-4">
                              <span className="flex items-center">
                                {getCategoryIcon(donation.category)}
                                <span className="ml-1">{getCategoryDisplay(donation.category)}</span>
                              </span>
                              <span>Quantity: {donation.quantity}</span>
                            </div>
                            
                            {donation.description && (
                              <p className="text-sm text-gray-600">{donation.description}</p>
                            )}
                            
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatDate(donation.created_at)}
                            </div>
                          </div>

                          <div className="space-y-2 text-sm text-gray-600">
                            <p><span className="font-medium">Location:</span> {donation.location}</p>
                          </div>
                        </div>
                      </div>

                      {donation.status === 'pending' && (
                        <div className="flex space-x-2 ml-4">
                          <button 
                            onClick={() => openConfirmDialog(donation.id, 'received')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                            title="Accept donation"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => openConfirmDialog(donation.id, 'rejected')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Reject donation"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-8">
                  {selectedStatus === 'All'
                    ? 'No donations available.'
                    : selectedStatus === 'pending'
                    ? 'No pending donations available.'
                    : selectedStatus === 'received'
                    ? 'You haven\'t accepted any donations yet.'
                    : 'No rejected donations.'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedDonation.action === 'received' ? 'Accept Donation' : 'Reject Donation'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {selectedDonation.action === 'received' ? 'accept' : 'reject'} this donation?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusChange}
              className={selectedDonation.action === 'received' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {selectedDonation.action === 'received' ? 'Accept' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReceiverDashboard;
