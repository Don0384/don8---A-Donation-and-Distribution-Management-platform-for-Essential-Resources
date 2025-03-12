
import UserTypeCard from "@/components/UserTypeCard";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { Key } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 relative">
        {/* Admin login link - small and subtle in the top right */}
        <div className="absolute top-4 right-4">
          <Link
            to="/auth/admin"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full"
            title="Admin access"
            aria-label="Admin access"
          >
            <Key className="w-5 h-5" />
          </Link>
        </div>
        
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Welcome to Don8
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Join our community of generous donors and deserving receivers. Make a difference in someone's life today.
          </p>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
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
