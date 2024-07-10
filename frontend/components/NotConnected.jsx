"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
const NotConnected = () => {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="w-full">
        <Alert className="w-full flex flex-col items-center justify-center text-1xl p-4 bg-[#706C61] rounded-xl">
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Please connect your wallet to use the app !
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default NotConnected;
