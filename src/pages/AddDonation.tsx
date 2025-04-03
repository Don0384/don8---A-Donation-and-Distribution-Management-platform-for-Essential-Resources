
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, XCircle, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { DonationConfirmDialog } from "@/components/donations/DonationConfirmDialog";
import { ImageUploader } from "@/components/donations/ImageUploader";

const AddDonation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    quantity: "",
    category: "",
    location: ""
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };

  const handleConfirmDonation = async (expiryTime?: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add a donation.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const donationData = {
        donor_id: user.id,
        item_name: formData.itemName,
        description: formData.description || null,
        quantity: formData.quantity,
        category: formData.category,
        location: formData.location,
        status: 'pending',
        expiry_time: expiryTime ? new Date(Date.now() + parseTimeToMilliseconds(expiryTime)).toISOString() : null,
        images: uploadedImages.length > 0 ? uploadedImages : null
      };

      console.log("Submitting donation with data:", donationData);

      const { data, error } = await supabase
        .from('donations')
        .insert(donationData)
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "Your donation has been submitted successfully.",
      });

      setTimeout(() => {
        navigate("/donor/dashboard");
      }, 1500);
    } catch (error: any) {
      console.error('Error adding donation:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while submitting your donation.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const parseTimeToMilliseconds = (time: string): number => {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return ((hours * 60 + minutes) * 60 + seconds) * 1000;
  };

  const handleImageUpload = (urls: string[]) => {
    setUploadedImages(prev => {
      const newImages = [...prev, ...urls];
      // Limit to 3 images
      return newImages.slice(0, 3);
    });
  };

  const removeImage = (urlToRemove: string) => {
    setUploadedImages(prev => prev.filter(url => url !== urlToRemove));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 p-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/donor/dashboard")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Donation</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="itemName" className="block text-sm font-medium text-gray-700">
                Item Name
              </label>
              <Input
                id="itemName"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                placeholder="Enter item name"
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter item description"
                className="w-full min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Quantity
              </label>
              <Input
                id="quantity"
                name="quantity"
                type="text"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Enter quantity (e.g., 5 boxes, 10 pieces)"
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <Select onValueChange={handleCategoryChange} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clothes">Clothes</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="electronics">Electronic Equipment</SelectItem>
                  <SelectItem value="medical_equipment">Medical Equipment</SelectItem>
                  <SelectItem value="medicine">Medicine</SelectItem>
                  <SelectItem value="toys">Toys</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter pickup location"
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Images (up to 3)
              </label>
              
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {uploadedImages.map((url, index) => (
                    <div key={index} className="relative border rounded-md overflow-hidden h-24">
                      <img 
                        src={url} 
                        alt={`Upload ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="absolute top-1 right-1 bg-white bg-opacity-70 rounded-full p-1"
                      >
                        <XCircle className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {uploadedImages.length < 3 && (
                <ImageUploader 
                  onUpload={handleImageUpload}
                  onUploading={setIsUploading}
                />
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-donor-primary hover:bg-donor-hover"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Add Donation"
              )}
            </Button>
          </form>

          <DonationConfirmDialog
            isOpen={showConfirmDialog}
            onClose={() => setShowConfirmDialog(false)}
            onConfirm={handleConfirmDonation}
            itemName={formData.itemName}
            isFood={formData.category === "food"}
          />
        </div>
      </div>
    </div>
  );
};

export default AddDonation;
