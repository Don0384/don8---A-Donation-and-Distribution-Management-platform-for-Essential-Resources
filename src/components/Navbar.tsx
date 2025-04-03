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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navbar = () => {
  const { isAuthenticated, userType } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const getProfilePath = () => {
    if (userType === "donor") return "/donor/profile";
    if (userType === "receiver") return "/receiver/profile";
    if (userType === "admin") return "/admin/profile";
    return "#";
  };

  const getDashboardPath = () => {
    if (userType === "donor") return "/donor/dashboard";
    if (userType === "receiver") return "/receiver/dashboard";
    if (userType === "admin") return "/admin/dashboard";
    return "/";
  };

  const handleAuthNavigation = (type: string) => {
    navigate(`/auth/${type}`);
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
          
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-gray-700 dark:text-gray-300"
                  aria-label="Toggle mobile menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="py-4">
                  <div className="space-y-4">
                    {isAuthenticated ? (
                      <>
                        <h2 className="text-lg font-medium mb-2 px-2">Menu</h2>
                        {userType === "donor" && (
                          <>
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-donor-primary hover:bg-donor-primary/10"
                              onClick={() => navigate("/donor/dashboard")}
                            >
                              <Heart className="w-4 h-4 mr-2" />
                              Dashboard
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => navigate("/donor/profile")}
                            >
                              <User className="w-4 h-4 mr-2" />
                              Profile
                            </Button>
                          </>
                        )}
                        
                        {userType === "receiver" && (
                          <>
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-receiver-primary hover:bg-receiver-primary/10"
                              onClick={() => navigate("/receiver/dashboard")}
                            >
                              <Users className="w-4 h-4 mr-2" />
                              Dashboard
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => navigate("/receiver/profile")}
                            >
                              <User className="w-4 h-4 mr-2" />
                              Profile
                            </Button>
                          </>
                        )}
                        
                        {userType === "admin" && (
                          <>
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                              onClick={() => navigate("/admin/dashboard")}
                            >
                              <LayoutDashboard className="w-4 h-4 mr-2" />
                              Admin Dashboard
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => navigate("/admin/profile")}
                            >
                              <User className="w-4 h-4 mr-2" />
                              Profile
                            </Button>
                          </>
                        )}
                        
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-red-500"
                          onClick={handleLogout}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => handleAuthNavigation("donor")}
                          className="w-full text-donor-primary border-donor-primary/20"
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          Donor Login
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleAuthNavigation("receiver")}
                          className="w-full text-receiver-primary border-receiver-primary/20"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Receiver Login
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
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
                      onClick={() => navigate(getProfilePath())}
                      className="cursor-pointer flex items-center py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
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
                  onClick={() => handleAuthNavigation("donor")}
                  className="text-donor-primary border-donor-primary/20 hover:bg-donor-primary/10 transition-colors"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Donor Login
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAuthNavigation("receiver")}
                  className="text-receiver-primary border-receiver-primary/20 hover:bg-receiver-primary/10 transition-colors"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Receiver Login
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
