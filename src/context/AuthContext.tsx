
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthUser, getSession } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  session: Session | null;
  user: AuthUser;
  loading: boolean;
  isAuthenticated: boolean;
  userType: "donor" | "receiver" | "admin" | null;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  isAuthenticated: false,
  userType: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<"donor" | "receiver" | "admin" | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function loadUserData() {
      try {
        setLoading(true);
        // Get initial session
        const initialSession = await getSession();
        setSession(initialSession);
        setUser(initialSession?.user || null);
        
        if (initialSession?.user) {
          // Get user type from user metadata
          const type = initialSession.user.user_metadata.user_type as "donor" | "receiver" | "admin" | undefined;
          setUserType(type || null);
          console.log("Auth initialized with session:", !!initialSession);
        }

        // Set up listener for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log("Auth state changed:", event);
            
            // Only update state if there's a real change to avoid unnecessary renders
            if (event !== 'INITIAL_SESSION') {
              setSession(currentSession);
              setUser(currentSession?.user || null);
              
              if (currentSession?.user) {
                const type = currentSession.user.user_metadata.user_type as "donor" | "receiver" | "admin" | undefined;
                setUserType(type || null);
                
                if (event === "SIGNED_IN") {
                  toast({
                    title: "Signed in",
                    description: "Welcome back!",
                  });
                }
              } else {
                setUserType(null);
                
                if (event === "SIGNED_OUT") {
                  toast({
                    title: "Signed out",
                    description: "You have been signed out successfully.",
                  });
                }
              }
            }
          }
        );

        setLoading(false);
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error loading user data:", error);
        setLoading(false);
      }
    }

    loadUserData();
  }, [toast]);

  const value = {
    session,
    user,
    loading,
    isAuthenticated: !!session,
    userType,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
