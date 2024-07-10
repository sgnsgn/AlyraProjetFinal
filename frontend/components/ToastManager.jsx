import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";

const ToastManager = ({
  hash,
  isLoading,
  isPending,
  isSuccess,
  error,
  alertDescription,
}) => {
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error.shortMessage || error.message,
        className: "bg-red-600",
      });
    } else if (isPending) {
      toast({
        title: "Pending",
        description:
          alertDescription + " is pending..." || "Transaction is pending...",
        className: "bg-[#1B1D1F]",
      });
    } else if (isLoading) {
      toast({
        title: "Loading",
        description:
          alertDescription + " in progress..." || "Transaction in progress...",
        className: "bg-[#1B1D1F]",
      });
    } else if (isSuccess) {
      toast({
        title: "Success",
        description: `Transaction successful: ${hash}`,
        className: "bg-[#0E0C09]",
      });
    }
  }, [hash, isPending, isLoading, isSuccess, error, toast, alertDescription]);

  return null;
};

export default ToastManager;
