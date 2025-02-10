
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const AddDonation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    donorName: "",
    itemNames: "",
    quantity: "",
    category: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show success toast
    toast({
      title: "Success!",
      description: "Your donation has been submitted successfully.",
    });

    // Navigate back to dashboard after a short delay
    setTimeout(() => {
      navigate("/donor/dashboard");
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <button
        onClick={() => navigate("/donor/dashboard")}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </button>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Donation</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="donorName" className="block text-sm font-medium text-gray-700">
              Donor Name
            </label>
            <Input
              id="donorName"
              name="donorName"
              value={formData.donorName}
              onChange={handleChange}
              placeholder="Enter donor name"
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="itemNames" className="block text-sm font-medium text-gray-700">
              Item Description
            </label>
            <Input
              id="itemNames"
              name="itemNames"
              value={formData.itemNames}
              onChange={handleChange}
              placeholder="Enter item description"
              className="w-full"
              required
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
                <SelectItem value="medical-equipment">Medical Equipment</SelectItem>
                <SelectItem value="medicine">Medicine</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full bg-donor-primary hover:bg-donor-hover">
            Add Donation
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddDonation;
