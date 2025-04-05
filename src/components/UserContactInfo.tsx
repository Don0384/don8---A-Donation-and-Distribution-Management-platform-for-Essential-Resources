
import { DonationUser } from "@/types/donations";
import { Mail, Phone, User } from "lucide-react";

interface UserContactInfoProps {
  user: DonationUser | null;
  title: string;
  className?: string;
}

export function UserContactInfo({ user, title, className = "" }: UserContactInfoProps) {
  if (!user) {
    return (
      <div className={`bg-gray-50 p-4 rounded-lg ${className}`}>
        <h3 className="text-sm font-medium text-gray-500">No {title} information available</h3>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 p-4 rounded-lg ${className}`}>
      <h3 className="text-sm font-medium text-gray-900 mb-3">{title} Contact Information</h3>
      
      <div className="space-y-2">
        <div className="flex items-center text-sm">
          <User className="w-4 h-4 mr-2 text-gray-500" />
          <span className="text-gray-900">
            {user.first_name} {user.last_name}
          </span>
        </div>
        
        {user.email && (
          <div className="flex items-center text-sm">
            <Mail className="w-4 h-4 mr-2 text-gray-500" />
            <a 
              href={`mailto:${user.email}`} 
              className="text-blue-600 hover:underline"
            >
              {user.email}
            </a>
          </div>
        )}
        
        {user.phone && (
          <div className="flex items-center text-sm">
            <Phone className="w-4 h-4 mr-2 text-gray-500" />
            <a 
              href={`tel:${user.phone}`} 
              className="text-blue-600 hover:underline"
            >
              {user.phone}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
