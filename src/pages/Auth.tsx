
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { signIn, signUp } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthIcon from "@/components/auth/AuthIcon";
import AuthForm from "@/components/auth/AuthForm";
import AuthToggle from "@/components/auth/AuthToggle";

const Auth = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, userType, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    adminCode: "",
  });
  
  const isDonor = type === "donor";
  const isAdmin = type === "admin";
  let title = isDonor ? "Donor" : isAdmin ? "Admin" : "Receiver";

  // Redirect if already authenticated - only after auth has finished loading
  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (userType === "donor") {
        navigate("/donor/dashboard", { replace: true });
      } else if (userType === "receiver") {
        navigate("/receiver/dashboard", { replace: true });
      } else if (userType === "admin") {
        navigate("/admin/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, userType, loading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Function to validate email
  const isValidEmail = (email: string): boolean => {
    // Regular expression for general email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        await signIn({ 
          email: formData.email, 
          password: formData.password 
        });
        // Don't navigate here - let the auth state change handler do it
      } else {
        // Validate required fields for signup
        if (!formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.phone) {
          throw new Error("All fields are required");
        }
        
        // Validate email format
        if (!isValidEmail(formData.email)) {
          throw new Error("Please enter a valid email address");
        }
        
        await signUp({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          userType: isAdmin ? "admin" : (isDonor ? "donor" : "receiver"),
          adminCode: isAdmin ? formData.adminCode : undefined
        });
        
        toast({
          title: "Account created",
          description: "Please check your email to confirm your account.",
        });
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        title: "Authentication Error",
        description: error.message || "An error occurred during authentication.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // If still loading auth state, show minimal UI to prevent flashing
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <AuthHeader />
      
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <AuthIcon isDonor={isDonor} isAdmin={isAdmin} />
          
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {isLogin ? `Login as ${title}` : `Sign up as ${title}`}
          </h2>
        </div>

        <div className="mt-8">
          <AuthForm 
            isLogin={isLogin}
            isLoading={isLoading}
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            isDonor={isDonor}
            isAdmin={isAdmin}
            title={title}
          />

          <AuthToggle
            isLogin={isLogin}
            setIsLogin={setIsLogin}
            isDonor={isDonor}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;
