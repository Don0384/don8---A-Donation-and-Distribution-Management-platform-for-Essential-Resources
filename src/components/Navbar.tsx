
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/lib/auth";
import { Heart, Users, LogOut, User, LayoutDashboard, Menu } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

const Navbar = () => {
  const { isAuthenticated, userType } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      // The navigation and toast will be handled by the auth state change in AuthContext
      console.log("Logout initiated");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-heading font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">Don8</span>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMobileMenu}
              className="text-gray-700 dark:text-gray-300"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {userType === "donor" && (
                  <Button
                    variant="ghost"
                    className="text-donor-primary hover:bg-donor-primary/10 px-4 transition-all"
                    onClick={() => navigate("/donor/dashboard")}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                )}
                
                {userType === "receiver" && (
                  <Button
                    variant="ghost"
                    className="text-receiver-primary hover:bg-receiver-primary/10 px-4 transition-all"
                    onClick={() => navigate("/receiver/dashboard")}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                )}
                
                {userType === "admin" && (
                  <Button
                    variant="ghost"
                    className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-4 transition-all"
                    onClick={() => navigate("/admin/dashboard")}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Admin Dashboard
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 p-2">
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="cursor-pointer flex items-center py-2 px-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/auth/donor")}
                  className="text-donor-primary border-donor-primary/20 hover:bg-donor-primary/10 transition-colors"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Donor Login
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/auth/receiver")}
                  className="text-receiver-primary border-receiver-primary/20 hover:bg-receiver-primary/10 transition-colors"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Receiver Login
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile menu, show/hide based on menu state */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-800 animate-fade-in">
            {isAuthenticated ? (
              <div className="flex flex-col space-y-3 px-2">
                {userType === "donor" && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-donor-primary"
                    onClick={() => {
                      navigate("/donor/dashboard");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                )}
                
                {userType === "receiver" && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-receiver-primary"
                    onClick={() => {
                      navigate("/receiver/dashboard");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                )}
                
                {userType === "admin" && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700 dark:text-gray-300"
                    onClick={() => {
                      navigate("/admin/dashboard");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Admin Dashboard
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3 px-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigate("/auth/donor");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-donor-primary border-donor-primary/20"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Donor Login
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigate("/auth/receiver");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-receiver-primary border-receiver-primary/20"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Receiver Login
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
