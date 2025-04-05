
import { Dispatch, SetStateAction } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StatusFilterProps {
  selectedStatus: string;
  onStatusChange: Dispatch<SetStateAction<string>>;
}

const StatusFilter = ({ selectedStatus, onStatusChange }: StatusFilterProps) => {
  return (
    <div className="flex items-center">
      <span className="mr-2 text-sm font-medium">Status:</span>
      <Select
        value={selectedStatus}
        onValueChange={(value) => onStatusChange(value)}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="received">Received</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default StatusFilter;
