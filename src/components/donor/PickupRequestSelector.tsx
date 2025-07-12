import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, User, Calendar } from 'lucide-react';
import { PickupRequestWithProfile } from '@/types/notifications';
import { formatDate } from '@/utils/dateUtils';

interface PickupRequestSelectorProps {
  donationId: number;
  donationTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PickupRequestSelector = ({
  donationId,
  donationTitle,
  isOpen,
  onClose,
  onSuccess
}: PickupRequestSelectorProps) => {
  const [pickupRequests, setPickupRequests] = useState<PickupRequestWithProfile[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PickupRequestWithProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { toast } = useToast();

  const fetchPickupRequests = async () => {
    if (!donationId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pickup_requests')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name
          )
        `)
        .eq('donation_id', donationId)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedData = (data || []).map(request => ({
        id: request.id,
        user_id: request.user_id,
        donation_id: request.donation_id!,
        pickup_time: request.pickup_time,
        status: request.status as 'pending' | 'accepted' | 'rejected',
        created_at: request.created_at,
        profile: Array.isArray(request.profiles) ? request.profiles[0] : request.profiles
      }));

      setPickupRequests(formattedData);
    } catch (error: any) {
      console.error('Error fetching pickup requests:', error);
      toast({
        title: "Error",
        description: "Failed to load pickup requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRecipient = async () => {
    if (!selectedRequest) return;

    setIsLoading(true);
    try {
      // Update donation with selected recipient
      const { error: donationError } = await supabase
        .from('donations')
        .update({ 
          receiver_id: selectedRequest.user_id,
          status: 'received'
        })
        .eq('id', donationId);

      if (donationError) throw donationError;

      // Update pickup request status
      const { error: pickupError } = await supabase
        .from('pickup_requests')
        .update({ status: 'accepted' })
        .eq('id', selectedRequest.id);

      if (pickupError) throw pickupError;

      // Reject other pickup requests
      const { error: rejectError } = await supabase
        .from('pickup_requests')
        .update({ status: 'rejected' })
        .eq('donation_id', donationId)
        .neq('id', selectedRequest.id);

      if (rejectError) throw rejectError;

      // Send notification to selected recipient
      await supabase.rpc('send_notification', {
        recipient_id: selectedRequest.user_id,
        notification_type: 'recipient_selected',
        notification_title: 'You\'ve been selected!',
        notification_message: `Your pickup request for "${donationTitle}" has been accepted by the donor.`,
        notification_data: { donation_id: donationId, pickup_time: selectedRequest.pickup_time }
      });

      toast({
        title: "Recipient Selected",
        description: `${selectedRequest.profile?.first_name || 'Recipient'} has been notified about the selection.`,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error selecting recipient:', error);
      toast({
        title: "Error",
        description: "Failed to select recipient. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPickupRequests();
    }
  }, [isOpen, donationId]);

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Recipient</DialogTitle>
            <DialogDescription>
              Choose who should receive "{donationTitle}". They will be notified of your selection.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : pickupRequests.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center py-8">
                  <User className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    No pickup requests yet. Recipients who are interested will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              pickupRequests.map((request) => (
                <Card 
                  key={request.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedRequest?.id === request.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedRequest(request)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(request.profile?.first_name, request.profile?.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {request.profile?.first_name && request.profile?.last_name
                              ? `${request.profile.first_name} ${request.profile.last_name}`
                              : 'Anonymous User'
                            }
                          </p>
                          <div className="flex items-center text-sm text-muted-foreground space-x-4">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{new Date(request.pickup_time).toLocaleTimeString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(request.pickup_time)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {request.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={() => setIsConfirmOpen(true)}
              disabled={!selectedRequest || isLoading}
            >
              Select Recipient
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Recipient Selection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to select{' '}
              <strong>
                {selectedRequest?.profile?.first_name && selectedRequest?.profile?.last_name
                  ? `${selectedRequest.profile.first_name} ${selectedRequest.profile.last_name}`
                  : 'this recipient'
                }
              </strong>{' '}
              for pickup? This action cannot be undone and other requests will be rejected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSelectRecipient} disabled={isLoading}>
              {isLoading ? 'Selecting...' : 'Confirm Selection'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};