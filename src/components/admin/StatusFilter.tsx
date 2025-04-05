
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatusFilterProps {
  value?: string;
  onValueChange?: (value: string) => void;
  selectedStatus?: string;
  onStatusChange?: (status: string) => void;
}

const StatusFilter = ({ value, onValueChange, selectedStatus, onStatusChange }: StatusFilterProps) => {
  // Use either the new or old prop names
  const currentValue = value || selectedStatus || "all";
  const handleChange = onValueChange || onStatusChange || (() => {});

  return (
    <Select value={currentValue} onValueChange={handleChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="All statuses" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All statuses</SelectItem>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="received">Received</SelectItem>
        <SelectItem value="rejected">Rejected</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default StatusFilter;
