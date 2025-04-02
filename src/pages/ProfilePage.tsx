
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { ProfileDetails } from "@/components/profile/ProfileDetails";

const ProfilePage = () => {
  const { userType } = useAuth();
  
  let userTypeLabel = "Your";
  if (userType === "donor") {
    userTypeLabel = "Donor";
  } else if (userType === "receiver") {
    userTypeLabel = "Receiver";
  } else if (userType === "admin") {
    userTypeLabel = "Admin";
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{userTypeLabel} Profile</h1>
        <div className="max-w-3xl mx-auto">
          <ProfileDetails />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
