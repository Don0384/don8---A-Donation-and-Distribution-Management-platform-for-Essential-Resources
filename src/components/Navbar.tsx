
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/lib/auth";
import { Heart, Users, LogOut, User, LayoutDashboard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { isAuthenticated, userType } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">Don8</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {userType === "donor" && (
                  <Button
                    variant="ghost"
                    className="text-donor-primary"
                    onClick={() => navigate("/donor/dashboard")}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                )}
                
                {userType === "receiver" && (
                  <Button
                    variant="ghost"
                    className="text-receiver-primary"
                    onClick={() => navigate("/receiver/dashboard")}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                )}
                
                {userType === "admin" && (
                  <Button
                    variant="ghost"
                    className="text-gray-700"
                    onClick={() => navigate("/admin/dashboard")}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Admin Dashboard
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => navigate("/auth/donor")}
                  className="text-donor-primary border-donor-primary/20 hover:bg-donor-primary/10"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Donor Login
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/auth/receiver")}
                  className="text-receiver-primary border-receiver-primary/20 hover:bg-receiver-primary/10"
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
