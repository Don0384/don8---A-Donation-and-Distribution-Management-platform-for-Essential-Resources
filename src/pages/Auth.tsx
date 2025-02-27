
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, Users, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { signIn, signUp } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  });
  
  const isDonor = type === "donor";
  const title = isDonor ? "Donor" : "Receiver";

  // Redirect if already authenticated
  if (isAuthenticated) {
    if (userType === "donor") {
      navigate("/donor/dashboard");
    } else if (userType === "receiver") {
      navigate("/receiver/dashboard");
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
          userType: isDonor ? "donor" : "receiver"
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
      <button
        onClick={() => navigate("/")}
        className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to home
      </button>
      
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
            isDonor ? "bg-donor-primary/10" : "bg-receiver-primary/10"
          }`}>
            {isDonor ? (
              <Heart className="w-10 h-10 text-donor-primary" />
            ) : (
              <Users className="w-10 h-10 text-receiver-primary" />
            )}
          </div>
          
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {isLogin ? `Login as ${title}` : `Sign up as ${title}`}
          </h2>
        </div>

        <div className="mt-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="mt-1"
                    placeholder="Enter your phone number"
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors duration-200 ${
                isDonor
                  ? "bg-donor-primary hover:bg-donor-hover focus:ring-donor-primary"
                  : "bg-receiver-primary hover:bg-receiver-hover focus:ring-receiver-primary"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? "Logging in..." : "Signing up..."}
                </>
              ) : (
                <>{isLogin ? "Login" : "Sign up"}</>
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className={`font-medium ${
                isDonor ? "text-donor-primary" : "text-receiver-primary"
              } hover:underline`}
            >
              {isLogin ? "Sign up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
