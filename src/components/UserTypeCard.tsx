
import { Heart, Users, Key } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface UserTypeCardProps {
  type: "donor" | "receiver" | "admin";
  title: string;
  description: string;
}

const UserTypeCard = ({ type, title, description }: UserTypeCardProps) => {
  const isDonor = type === "donor";
  const isAdmin = type === "admin";
  
  return (
    <motion.div 
      className="w-full max-w-sm p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 card-gradient"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.4, 0, 0.2, 1],
        opacity: { duration: 0.5 }
      }}
    >
      <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
        isAdmin ? "bg-gray-200 dark:bg-gray-700" :
        isDonor 
          ? "bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 dark:from-indigo-500/30 dark:to-indigo-600/20" 
          : "bg-gradient-to-br from-pink-500/20 to-pink-600/10 dark:from-pink-500/30 dark:to-pink-600/20"
      }`}>
        {isAdmin ? (
          <Key className="w-12 h-12 text-gray-700 dark:text-gray-300" />
        ) : isDonor ? (
          <Heart className="w-12 h-12 text-donor-primary" />
        ) : (
          <Users className="w-12 h-12 text-receiver-primary" />
        )}
      </div>
      
      <h2 className="mt-6 text-2xl font-bold text-center font-heading text-gray-800 dark:text-white">
        {title}
      </h2>
      
      <p className="mt-4 text-center text-gray-600 dark:text-gray-300">
        {description}
      </p>
      
      <Link
        to={`/auth/${type}`}
        className={`mt-8 w-full block py-3 px-4 rounded-lg text-center text-white font-medium transition-colors duration-300 ${
          isAdmin
            ? "bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600"
            : isDonor
              ? "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
              : "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700"
        }`}
      >
        Login as {title}
      </Link>
    </motion.div>
  );
};

export default UserTypeCard;
