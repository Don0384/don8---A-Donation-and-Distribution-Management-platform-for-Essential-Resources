
import { type ReactNode } from "react";
import { User } from "@supabase/supabase-js";

interface DashboardHeaderProps {
  title?: string;
  user?: User | null;
  children?: ReactNode;
}

const DashboardHeader = ({ title, user, children }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">{title || `Welcome, ${user?.email || 'Admin'}`}</h1>
      {children && <div className="flex space-x-4">{children}</div>}
    </div>
  );
};

export default DashboardHeader;
