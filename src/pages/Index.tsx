
import UserTypeCard from "@/components/UserTypeCard";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { Key, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <Navbar />
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 relative">
        {/* Admin login link - small and subtle in the top right */}
        <div className="absolute top-4 right-4">
          <Link
            to="/auth/admin"
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full"
            title="Admin access"
            aria-label="Admin access"
          >
            <Key className="w-5 h-5" />
          </Link>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.h1 
              className="text-5xl font-bold font-heading bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent sm:text-6xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Welcome to Don8
            </motion.h1>
            <motion.p 
              className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Join our community of generous donors and deserving receivers. Make a difference in someone's life today.
            </motion.p>
            
            <motion.div 
              className="mt-8 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <a href="#options" className="flex flex-col items-center text-gray-500 hover:text-indigo-600 transition-colors">
                <span className="text-sm mb-2">Explore Options</span>
                <ChevronDown className="w-6 h-6 animate-bounce" />
              </a>
            </motion.div>
          </div>
          
          <div id="options" className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-10 justify-items-center">
            <UserTypeCard
              type="donor"
              title="Donor"
              description="Support causes and make a difference in people's lives through your generous donations."
            />
            <UserTypeCard
              type="receiver"
              title="Receiver"
              description="Connect with donors and receive support for your cause or needs."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
