
import React from "react";
import { Badge } from "@/components/ui/badge";

interface NotificationBadgeProps {
  count: number;
  size?: "sm" | "md" | "lg";
}

export const NotificationBadge = ({ count, size = "sm" }: NotificationBadgeProps) => {
  if (count === 0) return null;
  
  const sizeClasses = {
    sm: "min-w-[1.25rem] h-5 text-xs",
    md: "min-w-[1.5rem] h-6 text-sm",
    lg: "min-w-[1.75rem] h-7 text-base"
  };
  
  return (
    <Badge 
      variant="destructive" 
      className={`absolute -top-2 -right-2 flex items-center justify-center p-1 font-semibold ${sizeClasses[size]}`}
    >
      {count > 9 ? "9+" : count}
    </Badge>
  );
};
