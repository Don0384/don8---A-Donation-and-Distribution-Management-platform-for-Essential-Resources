
import { type ReactNode } from "react";

interface DashboardHeaderProps {
  title: string;
  children?: ReactNode;
}

const DashboardHeader = ({ title, children }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      {children && <div className="flex space-x-4">{children}</div>}
    </div>
  );
};

export default DashboardHeader;
