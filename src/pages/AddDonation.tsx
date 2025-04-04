
import Navbar from "@/components/Navbar";
import { DonationForm } from "@/components/donations/DonationForm";

const AddDonation = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-900">
            Create New Donation
          </h1>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <DonationForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDonation;
