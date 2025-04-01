
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
        
        // First, get all messages
        const { data: messageData, error: messageError } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (messageError) throw messageError;
        
        // For each message, fetch the profile information separately
        const messagesWithProfiles = await Promise.all(
          messageData.map(async (message) => {
            // Get profile information for the message sender
            const { data: profileData } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', message.user_id)
              .single();
              
            return {
              id: message.id,
              user_id: message.user_id,
              content: message.content,
              created_at: message.created_at,
              user_type: message.user_type as 'donor' | 'receiver',
              is_read: message.is_read,
              sender_name: profileData 
                ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() 
                : (message.user_type === 'receiver' ? 'Receiver' : 'Donor')
            };
          })
        );
        
        setMessages(messagesWithProfiles);
        
        // Mark all messages as read
        // Only mark as read messages that are not sent by the current user
        if (messageData && messageData.length > 0) {
          const messagesToMark = messageData.filter(msg => msg.user_id !== user.id);
          
          if (messagesToMark.length > 0) {
            const { error: updateError } = await supabase
              .from('messages')
              .update({ is_read: true })
              .in('id', messagesToMark.map(msg => msg.id));
              
            if (updateError) {
              console.error("Error marking messages as read:", updateError);
            }
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
