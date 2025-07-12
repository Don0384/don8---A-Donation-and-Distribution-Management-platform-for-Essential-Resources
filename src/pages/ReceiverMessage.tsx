
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";

const ReceiverMessage = () => {
  const { user, userType } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        title: "Message is empty",
        description: "Please enter a message before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    if (!user || !userType) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to send a message.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      console.log("Sending message with data:", {
        user_id: user.id,
        content: message,
        user_type: userType,
        is_read: false
      });
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          user_id: user.id,
          content: message,
          user_type: userType,
          is_read: false
        })
        .select();
        
      if (error) throw error;
      
      console.log("Message sent successfully:", data);
      
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully to all donors.",
      });
      
      // Clear the form and redirect
      setMessage("");
      navigate("/receiver/dashboard");
      
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 p-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Post a Public Message</h1>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message here..."
                  className="min-h-[200px] w-full"
                />
                <p className="mt-2 text-sm text-gray-500">
                  This message will be visible to all donors in the system.
                </p>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/receiver/dashboard")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiverMessage;
