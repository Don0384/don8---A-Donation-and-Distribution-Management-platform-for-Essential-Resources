
import { useState } from "react";
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
  const { isAuthenticated, userType } = useAuth();
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

  // Redirect if already authenticated
  if (isAuthenticated) {
    if (userType === "donor") {
      navigate("/donor/dashboard");
    } else if (userType === "receiver") {
      navigate("/receiver/dashboard");
    } else if (userType === "admin") {
      navigate("/admin/dashboard");
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      } else {
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
      
      // Navigation will be handled by the auth state change in AuthContext
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
