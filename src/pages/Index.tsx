
import UserTypeCard from "@/components/UserTypeCard";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
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
