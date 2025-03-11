
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
    <div className="w-full max-w-sm p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
        isAdmin ? "bg-gray-200" :
        isDonor ? "bg-donor-primary/10" : "bg-receiver-primary/10"
      }`}>
        {isAdmin ? (
          <Key className="w-12 h-12 text-gray-700" />
        ) : isDonor ? (
          <Heart className="w-12 h-12 text-donor-primary" />
        ) : (
          <Users className="w-12 h-12 text-receiver-primary" />
        )}
      </div>
      
      <h2 className="mt-6 text-2xl font-bold text-center text-gray-800">
        {title}
      </h2>
      
      <p className="mt-4 text-center text-gray-600">
        {description}
      </p>
      
      <Link
        to={`/auth/${type}`}
        className={`mt-8 w-full block py-3 px-4 rounded-lg text-center text-white font-medium transition-colors duration-200 ${
          isAdmin
            ? "bg-gray-800 hover:bg-gray-900"
            : isDonor
              ? "bg-donor-primary hover:bg-donor-hover"
              : "bg-receiver-primary hover:bg-receiver-hover"
        }`}
      >
        Login as {title}
      </Link>
    </div>
  );
};

export default UserTypeCard;
