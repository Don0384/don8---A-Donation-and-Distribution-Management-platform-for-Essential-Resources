
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { categories } from "@/types/receiverDashboard";
import { ImageUploader } from "./ImageUploader";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// Remove "All" from categories for donation form
const donationCategories = categories.filter(category => category.value !== "All");

const donationSchema = z.object({
  item_name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  quantity: z.string().min(1, "Quantity is required"),
  category: z.string().min(1, "Category is required"),
  location: z.string().min(1, "Location is required"),
  expiry_time: z.string().optional(),
});

type DonationFormValues = z.infer<typeof donationSchema>;

export function DonationForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const form = useForm<DonationFormValues>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      item_name: "",
      description: "",
      quantity: "",
      category: "",
      location: "",
      expiry_time: "",
    },
  });

  const handleImageUpload = (urls: string[]) => {
    setImages(prev => [...prev, ...urls]);
  };

  const handleImageRemove = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  async function onSubmit(data: DonationFormValues) {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a donation.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare the donation data to be submitted
      let expiryUTC: string | null = null;
if (data.expiry_time) {
  const localDate = new Date(data.expiry_time);
  const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
  expiryUTC = utcDate.toISOString();
  console.log("Selected time:", data.expiry_time);
  console.log("Converted UTC time:", expiryUTC);
}

const donationData = {
  item_name: data.item_name,
  description: data.description || null,
  quantity: data.quantity,
  category: data.category,
  location: data.location,
  donor_id: user.id,
  expiry_time: expiryUTC,
  images: images.length > 0 ? images : null,
};

      // Insert the donation into the database
      const { error } = await supabase.from("donations").insert(donationData);

      if (error) {
        throw error;
      }

      toast({
        title: "Donation Created",
        description: "Your donation has been successfully created.",
      });

      navigate("/donor/dashboard");
    } catch (error: any) {
      console.error("Error creating donation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create donation.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isFoodCategory = form.watch("category") === "food";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="item_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter item name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter item description"
                  {...field}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 2 boxes, 5 pieces" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {donationCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.value.charAt(0).toUpperCase() + category.value.slice(1).replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {isFoodCategory && (
          <FormField
            control={form.control}
            name="expiry_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiry Date and Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pickup Location</FormLabel>
              <FormControl>
                <Input placeholder="Enter pickup location" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Images (Optional, max 3)</FormLabel>
          <ImageUploader 
            onUpload={handleImageUpload}
            onUploading={setIsUploading}
            maxImages={3}
            currentImages={images}
            onRemove={handleImageRemove}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting ? "Creating Donation..." : "Create Donation"}
        </Button>
      </form>
    </Form>
  );
}
