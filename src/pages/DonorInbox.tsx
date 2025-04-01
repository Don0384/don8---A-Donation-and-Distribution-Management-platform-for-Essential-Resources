
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowLeft, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Message } from "@/types/messages";
import { formatDate } from "@/utils/dateUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
              // Ensure user_type is properly cast to the required type
              user_type: (message.user_type === 'donor' || message.user_type === 'receiver') 
                ? message.user_type as 'donor' | 'receiver' 
                : 'donor', // Default to 'donor' if it's neither
              is_read: message.is_read,
              sender_name: profileData 
                ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() 
                : (message.user_type === 'receiver' ? 'Receiver' : 'Donor')
            } as Message; // Explicitly cast the entire object to Message type
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
    <div className="min-h-screen bg-background flex flex-col bg-mesh-pattern">
      <Navbar />
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <MessageSquare className="text-primary h-7 w-7" />
              Message Inbox
            </h1>
            <Button
              onClick={() => navigate("/donor/dashboard")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading messages...</p>
              </div>
            </div>
          ) : error ? (
            <Card className="bg-destructive/5 border-destructive/20">
              <CardContent className="flex flex-col items-center py-12">
                <p className="text-destructive mb-4">{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  className="mt-2"
                >
                  Try again
                </Button>
              </CardContent>
            </Card>
          ) : messages.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-1">No messages yet</h3>
                <p className="text-muted-foreground text-center">
                  When you receive messages, they will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <Card 
                  key={message.id} 
                  className="overflow-hidden border-border/60 animate-fade-in"
                >
                  <CardContent className="p-0">
                    <div className="p-4 sm:p-6">
                      <div className="flex justify-between items-start mb-3">
                        <Badge
                          variant={message.user_type === 'receiver' ? 'info' : 'soft'}
                          className="px-3 py-1"
                        >
                          From {message.sender_name || (message.user_type === 'receiver' ? 'Receiver' : 'Donor')}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(message.created_at)}
                        </span>
                      </div>
                      <div className="bg-secondary/70 p-4 rounded-lg mt-3">
                        <p className="text-foreground whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorInbox;
