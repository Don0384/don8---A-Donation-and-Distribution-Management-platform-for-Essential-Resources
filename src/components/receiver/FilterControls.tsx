
import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories, categoryDisplayNames, statuses } from "@/types/receiverDashboard";

interface FilterControlsProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
}

export const FilterControls = ({
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus
}: FilterControlsProps) => {
  const getCategoryDisplay = (category: string) => {
    return categoryDisplayNames[category] || category;
  };

  return (
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
              <SelectItem key={status.value} value={status.value}>
                {status.value === "All" ? "All Statuses" : status.label}
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
              <SelectItem key={category.value} value={category.value}>
                {category.value === "All" ? "All Categories" : getCategoryDisplay(category.value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
