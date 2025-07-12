
import { useNavigate } from "react-router-dom";
import { Inbox, Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { NotificationBadge } from "@/components/notifications/NotificationBadge";
import { useNotificationSystem } from "@/hooks/useNotificationSystem";

type DashboardHeaderProps = {
  title: string;
  unreadMessageCount?: number;
};

export const DashboardHeader = ({ title, unreadMessageCount = 0 }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { unreadCount } = useNotificationSystem(user?.id);
  
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      
      <div className="flex items-center space-x-3">
        <div className="relative">
          <button
            onClick={() => navigate("/donor/inbox")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded-full flex items-center justify-center shadow-sm transition-colors"
            aria-label="View inbox"
          >
            <Inbox className="w-5 h-5" />
          </button>
          
          {unreadMessageCount > 0 && (
            <NotificationBadge count={unreadMessageCount} />
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {/* TODO: Add notifications panel */}}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground p-2 rounded-full flex items-center justify-center shadow-sm transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
          </button>
          
          {unreadCount > 0 && (
            <NotificationBadge count={unreadCount} />
          )}
        </div>
      </div>
    </div>
  );
};
