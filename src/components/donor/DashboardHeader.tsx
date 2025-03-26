
import { useNavigate } from "react-router-dom";
import { Inbox } from "lucide-react";

type DashboardHeaderProps = {
  title: string;
};

export const DashboardHeader = ({ title }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      
      <button
        onClick={() => navigate("/donor/inbox")}
        className="bg-donor-primary hover:bg-donor-hover text-white p-2 rounded-full flex items-center justify-center shadow-sm transition-colors"
        aria-label="View inbox"
      >
        <Inbox className="w-5 h-5" />
      </button>
    </div>
  );
};
