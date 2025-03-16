
import { Heart, Users, Key } from "lucide-react";
import { Link } from "react-router-dom";

interface UserTypeCardProps {
  type: "donor" | "receiver" | "admin";
  title: string;
  description: string;
}

const UserTypeCard = ({ type, title, description }: UserTypeCardProps) => {
  const isDonor = type === "donor";
  const isAdmin = type === "admin";
  
  return (
    <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
      <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
        isAdmin ? "bg-gray-200" :
        isDonor 
          ? "bg-blue-100" 
          : "bg-pink-100"
      }`}>
        {isAdmin ? (
          <Key className="w-8 h-8 text-gray-700" />
        ) : isDonor ? (
          <Heart className="w-8 h-8 text-blue-500" />
        ) : (
          <Users className="w-8 h-8 text-pink-500" />
        )}
      </div>
      
      <h2 className="mt-4 text-xl font-semibold text-center text-gray-800">
        {title}
      </h2>
      
      <p className="mt-2 text-center text-gray-600">
        {description}
      </p>
      
      <Link
        to={`/auth/${type}`}
        className={`mt-6 w-full block py-2 px-4 rounded text-center text-white font-medium ${
          isAdmin
            ? "bg-gray-600 hover:bg-gray-700"
            : isDonor
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-pink-500 hover:bg-pink-600"
        }`}
      >
        Login as {title}
      </Link>
    </div>
  );
};

export default UserTypeCard;
