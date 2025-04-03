
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { NotificationBadge } from "@/components/notifications/NotificationBadge";

type DashboardHeaderProps = {
  title: string;
  unreadMessageCount?: number;
};

export const DashboardHeader = ({ title, unreadMessageCount = 0 }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      
      <div className="relative">
        <button
          onClick={() => navigate("/donor/inbox")}
          className="bg-donor-primary hover:bg-donor-hover text-white p-2 rounded-full flex items-center justify-center shadow-sm transition-colors"
          aria-label="View inbox"
        >
          <Inbox className="w-5 h-5" />
        </button>
        
        {unreadMessageCount > 0 && (
          <NotificationBadge count={unreadMessageCount} />
        )}
      </div>
    </div>
  );
};
