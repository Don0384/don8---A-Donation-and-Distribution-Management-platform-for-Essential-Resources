
import { Heart, Users, Key } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UserTypeCardProps {
  type: "donor" | "receiver" | "admin";
  title: string;
  description: string;
}

const UserTypeCard = ({ type, title, description }: UserTypeCardProps) => {
  const isDonor = type === "donor";
  const isAdmin = type === "admin";
  
  const iconBackgroundColor = isAdmin 
    ? "bg-gray-100 dark:bg-gray-800" 
    : isDonor 
      ? "bg-primary/10" 
      : "bg-receiver-primary/10";
  
  const iconColor = isAdmin 
    ? "text-gray-700 dark:text-gray-300" 
    : isDonor 
      ? "text-primary" 
      : "text-receiver-primary";
  
  const buttonClassNames = `mt-6 w-full block py-3 px-4 rounded-lg text-center text-white font-medium transition-all ${
    isAdmin
      ? "bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
      : isDonor
        ? "bg-primary hover:bg-donor-hover shadow-sm hover:shadow-md btn-glow"
        : "bg-receiver-primary hover:bg-receiver-hover shadow-sm hover:shadow-md btn-glow"
  }`;
  
  return (
    <Card className="w-full max-w-sm animate-scale-in" gradient>
      <CardContent className="p-6 bg-card rounded-lg flex flex-col items-center">
        <Badge 
          variant={isDonor ? "soft" : "info"} 
          className="mb-6 px-3 py-1"
        >
          {isDonor ? "Be a giver" : "Receive support"}
        </Badge>
        
        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${iconBackgroundColor}`}>
          {isAdmin ? (
            <Key className={`w-10 h-10 ${iconColor}`} />
          ) : isDonor ? (
            <Heart className={`w-10 h-10 ${iconColor}`} />
          ) : (
            <Users className={`w-10 h-10 ${iconColor}`} />
          )}
        </div>
        
        <h2 className="mt-6 text-xl font-semibold text-center text-foreground">
          {title}
        </h2>
        
        <p className="mt-3 text-center text-muted-foreground">
          {description}
        </p>
        
        <Link
          to={`/auth/${type}`}
          className={buttonClassNames}
        >
          Login as {title}
        </Link>
      </CardContent>
    </Card>
  );
};

export default UserTypeCard;
