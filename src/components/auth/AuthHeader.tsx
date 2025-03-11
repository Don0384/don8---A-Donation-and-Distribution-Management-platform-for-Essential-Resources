
import { ArrowLeft, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AuthHeaderProps {
  isAdmin: boolean;
  toggleAdminMode: () => void;
}

const AuthHeader = ({ isAdmin, toggleAdminMode }: AuthHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-8">
      <button
        onClick={() => navigate("/")}
        className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to home
      </button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={toggleAdminMode}
        className="text-gray-600 hover:text-gray-800"
        title="Admin Login"
      >
        <Key className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default AuthHeader;
