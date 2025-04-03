
import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

interface ImageUploaderProps {
  onUpload: (urls: string[]) => void;
  onUploading: (isUploading: boolean) => void;
}

export const ImageUploader = ({ onUpload, onUploading }: ImageUploaderProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

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

  return (
    <div className="mt-2">
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
            <p className="text-sm text-gray-500">Click to add images</p>
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
    </div>
  );
};
