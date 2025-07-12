
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
import { useNotifications } from "@/hooks/useNotifications";

const DonorInbox = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { markMessagesSeen } = useNotifications("donor");

  useEffect(() => {
    let isMounted = true;
    
    async function fetchMessages() {
      if (!user) return;

      try {
        setIsLoading(true);
        
        // Get messages
        const { data: messageData, error: messageError } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (messageError) throw messageError;
        
        if (!isMounted) return;
        
        // For each message, get the profile data separately
        const transformedMessages = await Promise.all(messageData.map(async (message) => {
          // Get profile data in a separate query
          let senderName = message.user_type === 'receiver' ? 'Receiver' : 'Donor';
          
          if (message.user_id) {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', message.user_id)
              .single();
              
            if (profileData && !profileError) {
              // Only access first_name and last_name if profileData exists and there's no error
              const firstName = profileData.first_name || '';
              const lastName = profileData.last_name || '';
              senderName = `${firstName} ${lastName}`.trim();
              if (!senderName) {
                senderName = message.user_type === 'receiver' ? 'Receiver' : 'Donor';
              }
            }
          }
          
          return {
            id: message.id,
            user_id: message.user_id,
            content: message.content,
            created_at: message.created_at,
            user_type: (message.user_type === 'donor' || message.user_type === 'receiver') 
              ? message.user_type as 'donor' | 'receiver' 
              : 'donor',
            is_read: message.is_read,
            sender_name: senderName
          } as Message;
        }));
        
        setMessages(transformedMessages);
        
        // Mark messages as seen in the notifications system
        markMessagesSeen();
        
        // Mark all messages as read in a single batch operation
        const messagesToMark = messageData
          .filter(msg => msg.user_id !== user.id && !msg.is_read)
          .map(msg => msg.id);
          
        if (messagesToMark.length > 0) {
          const { error: updateError } = await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', messagesToMark);
            
          if (updateError) {
            console.error("Error marking messages as read:", updateError);
          }
        }
        
      } catch (err: any) {
        console.error("Error fetching messages:", err);
        if (isMounted) {
          setError(err.message);
          toast({
            title: "Error",
            description: "Failed to load messages. Please try again.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchMessages();
    
    return () => {
      isMounted = false;
    };
  }, [user, toast, markMessagesSeen]);

  // Set up a realtime listener for new messages
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase.channel('public:messages')
      .on('postgres_changes', { 
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, async (payload) => {
        console.log('New message:', payload);
        
        // Only process if it's relevant to this user
        if (payload.new.user_type === 'receiver') {
          // Get sender profile data in a separate query
          let senderName = 'Receiver';
          
          if (payload.new.user_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', payload.new.user_id)
              .single();
              
            if (profileData) {
              senderName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
              if (!senderName) {
                senderName = 'Receiver';
              }
            }
          }
            
          // Add the new message to our state
          const newMessage: Message = {
            id: payload.new.id,
            user_id: payload.new.user_id,
            content: payload.new.content,
            created_at: payload.new.created_at,
            user_type: payload.new.user_type as 'donor' | 'receiver',
            is_read: false,
            sender_name: senderName
          };
          
          setMessages(prev => [newMessage, ...prev]);
          
          // Mark as read immediately
          await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('id', payload.new.id);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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
                          variant={message.user_type === 'receiver' ? 'default' : 'secondary'}
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
