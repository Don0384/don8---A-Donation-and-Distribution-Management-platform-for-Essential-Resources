
import { Heart, Users, Key } from "lucide-react";

interface AuthIconProps {
  isDonor: boolean;
  isAdmin: boolean;
}

const AuthIcon = ({ isDonor, isAdmin }: AuthIconProps) => {
  return (
    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
      isAdmin 
        ? "bg-gray-200" 
        : (isDonor ? "bg-donor-primary/10" : "bg-receiver-primary/10")
    }`}>
      {isAdmin ? (
        <Key className="w-10 h-10 text-gray-700" />
      ) : isDonor ? (
        <Heart className="w-10 h-10 text-donor-primary" />
      ) : (
        <Users className="w-10 h-10 text-receiver-primary" />
      )}
    </div>
  );
};

export default AuthIcon;
