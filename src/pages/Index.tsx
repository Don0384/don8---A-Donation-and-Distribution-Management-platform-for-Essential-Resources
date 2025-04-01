
import UserTypeCard from "@/components/UserTypeCard";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { Key, ChevronDown } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col bg-mesh-pattern relative">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-radial from-primary/10 to-transparent opacity-70"></div>
      <Navbar />
      <div className="flex-1 py-16 px-4 sm:px-6 lg:px-8 relative">
        {/* Admin login link - small and subtle in the top right */}
        <div className="absolute top-4 right-4">
          <Link
            to="/auth/admin"
            className="p-2 text-foreground/40 hover:text-primary transition-colors rounded-full hover:bg-primary/10"
            title="Admin access"
            aria-label="Admin access"
          >
            <Key className="w-5 h-5" />
          </Link>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 animate-fade-in">
            <div className="inline-block mb-3 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
              Connect, Share, Support
            </div>
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl tracking-tight">
              Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7d5aff] to-[#ec74d3]">Don8</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Join our community of generous donors and deserving receivers. Make a difference in someone's life today.
            </p>
            
            <div className="mt-8 flex justify-center">
              <a 
                href="#options" 
                className="flex flex-col items-center text-primary hover:text-primary/70 transition-colors"
              >
                <span className="text-sm mb-2 font-medium">Explore Options</span>
                <div className="p-2 bg-primary/10 rounded-full animate-float">
                  <ChevronDown className="w-5 h-5" />
                </div>
              </a>
            </div>
          </div>
          
          <div 
            id="options" 
            className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center"
          >
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
