
import { FC } from "react";
import { NotificationBadge } from "@/components/notifications/NotificationBadge";

interface ReceiverDashboardHeaderProps {
  title: string;
  unreadMessageCount?: number;
}

export const ReceiverDashboardHeader: FC<ReceiverDashboardHeaderProps> = ({ 
  title, 
  unreadMessageCount = 0 
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      
      <div className="flex items-center gap-4">
        {unreadMessageCount > 0 && (
          <NotificationBadge count={unreadMessageCount} />
        )}
      </div>
    </div>
  );
};
