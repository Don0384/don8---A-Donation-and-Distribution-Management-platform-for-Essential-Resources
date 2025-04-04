
import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Upload, Loader2, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

interface ImageUploaderProps {
  onUpload: (urls: string[]) => void;
  onUploading: (isUploading: boolean) => void;
  maxImages?: number;
  currentImages?: string[];
  onRemove?: (index: number) => void;
}

export const ImageUploader = ({ 
  onUpload, 
  onUploading, 
  maxImages = 3, 
  currentImages = [],
  onRemove
}: ImageUploaderProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed the maximum
    if (currentImages.length + files.length > maxImages) {
      toast({
        title: "Too many images",
        description: `You can only upload a maximum of ${maxImages} images`,
        variant: "destructive",
      });
      e.target.value = '';
      return;
    }

    try {
      setIsUploading(true);
      onUploading(true);

      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `donations/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('donation-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          throw error;
        }

        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('donation-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(urlData.publicUrl);
      }

      onUpload(uploadedUrls);

      toast({
        title: "Images uploaded",
        description: `Successfully uploaded ${uploadedUrls.length} image(s)`,
      });

    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      onUploading(false);
      // Reset the input
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    if (onRemove) {
      onRemove(index);
    }
  };

  return (
    <div className="mt-2 space-y-4">
      {currentImages.length > 0 && (
        <div>
          <p className="text-sm text-gray-500 mb-2">Uploaded images ({currentImages.length}/{maxImages})</p>
          <div className="grid grid-cols-3 gap-2">
            {currentImages.map((url, index) => (
              <div key={index} className="relative h-24 border rounded overflow-hidden group">
                <img 
                  src={url} 
                  alt={`Uploaded image ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
                <button 
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentImages.length < maxImages && (
        <label
          htmlFor="image-upload"
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${
            isUploading ? 'opacity-50' : ''
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Loader2 className="w-8 h-8 text-gray-500 animate-spin mb-2" />
              <p className="text-sm text-gray-500">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <ImageIcon className="w-8 h-8 text-gray-500 mb-2" />
              <p className="text-sm text-gray-500">Click to add images ({currentImages.length}/{maxImages})</p>
              <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or GIF (max 5MB)</p>
            </div>
          )}
          <input
            id="image-upload"
            type="file"
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      )}
    </div>
  );
};
