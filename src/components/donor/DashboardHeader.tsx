
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";

type DashboardHeaderProps = {
  title: string;
};

export const DashboardHeader = ({ title }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchUnreadMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('id')
        .eq('is_read', false)
        .not('user_id', 'eq', user.id);
        
      if (error) {
        console.error("Error fetching unread messages:", error);
        return;
      }
      
      setUnreadCount(data?.length || 0);
    };
    
    fetchUnreadMessages();
    
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'messages' 
      }, () => {
        fetchUnreadMessages();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
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
        
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 flex items-center justify-center p-1 text-xs font-semibold"
          >
            {unreadCount}
          </Badge>
        )}
      </div>
    </div>
  );
};
