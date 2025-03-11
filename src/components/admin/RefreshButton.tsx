
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

interface RefreshButtonProps {
  loading: boolean;
  onClick: () => void;
}

const RefreshButton = ({ loading, onClick }: RefreshButtonProps) => {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      disabled={loading}
      title="Refresh"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
    </Button>
  );
};

export default RefreshButton;
