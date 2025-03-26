
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Message } from "@/types/messages";
import { formatDate } from "@/utils/dateUtils";

const DonorInbox = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMessages() {
      if (!user) return;

      try {
        setIsLoading(true);
        
        // Fetch messages with profile information
        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            profiles:user_id (
              first_name,
              last_name
            )
          `)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Transform the data to match our Message type
        const transformedMessages = data.map(item => ({
          id: item.id,
          user_id: item.user_id,
          content: item.content,
          created_at: item.created_at,
          user_type: item.user_type as 'donor' | 'receiver',
          is_read: item.is_read,
          sender_name: item.profiles ? 
            `${item.profiles.first_name || ''} ${item.profiles.last_name || ''}`.trim() :
            (item.user_type === 'receiver' ? 'Receiver' : 'Donor')
        }));
        
        setMessages(transformedMessages);
        
        // Mark all messages as read
        if (data && data.length > 0) {
          const { error: updateError } = await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', data.map(msg => msg.id));
            
          if (updateError) {
            console.error("Error marking messages as read:", updateError);
          }
        }
        
      } catch (err: any) {
        console.error("Error fetching messages:", err);
        setError(err.message);
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchMessages();
  }, [user, toast]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Message Inbox</h1>
            <button
              onClick={() => navigate("/donor/dashboard")}
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Back to Dashboard
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 text-blue-500 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <p className="text-gray-600">No messages available.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className="bg-white rounded-lg shadow-sm p-6"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      From {message.sender_name || (message.user_type === 'receiver' ? 'Receiver' : 'Donor')}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(message.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorInbox;
