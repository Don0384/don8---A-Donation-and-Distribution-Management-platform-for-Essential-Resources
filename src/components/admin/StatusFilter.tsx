
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface StatusFilterProps {
  value: string;
  onValueChange: (value: string) => void;
}

const statuses = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "received", label: "Received" },
  { value: "rejected", label: "Rejected" }
];

const StatusFilter = ({ value, onValueChange }: StatusFilterProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="min-w-[180px] justify-between">
          {statuses.find(status => status.value === value)?.label || 'Filter Status'}
          <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandList>
            <CommandEmpty>No status found.</CommandEmpty>
            <CommandGroup>
              {statuses.map((status) => (
                <CommandItem
                  key={status.value}
                  value={status.value}
                  onSelect={() => {
                    onValueChange(status.value);
                  }}
                >
                  {status.label}
                  {value === status.value && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default StatusFilter;
