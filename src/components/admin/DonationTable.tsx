
import { type DonationWithProfiles } from "@/types/donations";
import { X, Image as ImageIcon } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { deleteDonation } from "@/services/donationService";
import { useToast } from "@/hooks/use-toast";
import { ImageGallery } from "@/components/receiver/ImageGallery";

interface DonationTableProps {
  donations: DonationWithProfiles[];
  loading: boolean;
  onDonationRemoved?: (donationId: number) => void;
}

const DonationTable = ({ donations, loading, onDonationRemoved }: DonationTableProps) => {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedItemName, setSelectedItemName] = useState("");
  const [initialImageIndex, setInitialImageIndex] = useState(0);

  const handleDeleteDonation = async (donationId: number) => {
    try {
      setDeletingId(donationId);
      const success = await deleteDonation(donationId);
      
      if (!success) throw new Error("Failed to delete donation");
      
      toast({
        title: "Donation removed",
        description: "The donation has been successfully removed from the system."
      });
      
      if (onDonationRemoved) {
        onDonationRemoved(donationId);
      }
    } catch (err: any) {
      console.error('Error deleting donation:', err);
      toast({
        title: "Error",
        description: "Failed to remove the donation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const openGallery = (images: string[] | null, itemName: string, index: number = 0) => {
    if (images && images.length > 0) {
      setSelectedImages(images);
      setSelectedItemName(itemName);
      setInitialImageIndex(index);
      setShowGallery(true);
    } else {
      toast({
        title: "No Images",
        description: "There are no images available for this donation.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receiver</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {donations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No donations found
                  </td>
                </tr>
              ) : (
                donations.map((donation) => (
                  <tr key={donation.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{donation.item_name}</div>
                      <div className="text-sm text-gray-500">{donation.category}</div>
                      <div className="text-xs text-gray-500">{donation.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {donation.donor ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {donation.donor.first_name} {donation.donor.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{donation.donor.email}</div>
                          <div className="text-xs text-gray-500">{donation.donor.phone || 'No phone'}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Unknown donor</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {donation.receiver ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {donation.receiver.first_name} {donation.receiver.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{donation.receiver.email}</div>
                          <div className="text-xs text-gray-500">{donation.receiver.phone || 'No phone'}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No receiver yet</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${donation.status === 'received' ? 'bg-green-100 text-green-800' : 
                          donation.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(donation.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {donation.images && donation.images.length > 0 ? (
                        <div className="flex items-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openGallery(donation.images, donation.item_name)}
                            className="flex items-center space-x-1"
                          >
                            <ImageIcon className="h-4 w-4" />
                            <span>{donation.images.length} image{donation.images.length > 1 ? 's' : ''}</span>
                          </Button>
                        </div>
                      ) : (
                        <span>No images</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {donation.status === 'pending' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              disabled={deletingId === donation.id}
                            >
                              {deletingId === donation.id ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Donation</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove this donation? This action cannot be undone 
                                and the donation will be permanently deleted from the system.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteDonation(donation.id)}
                                className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showGallery && (
        <ImageGallery
          images={selectedImages}
          isOpen={showGallery}
          onClose={() => setShowGallery(false)}
          initialIndex={initialImageIndex}
          itemName={selectedItemName}
        />
      )}
    </>
  );
};

export default DonationTable;
