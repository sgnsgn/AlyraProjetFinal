import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useToast } from "./ui/use-toast";
import ToastManager from "./ToastManager";

const DevolverTokens = ({
  address,
  casinoAddress,
  casinoAbi,
  tokenAddress,
  tokenAbi,
  setRefresh,
}) => {
  const [numTokens, setNumTokens] = useState("");
  const { toast } = useToast();

  const {
    data: approveHash,
    isPending: isApprovePending,
    writeContract: approveTokens,
    error: approveError,
  } = useWriteContract();
  const {
    data: devolverHash,
    isPending: isDevolverPending,
    writeContract: devolverTokens,
    error: devolverError,
  } = useWriteContract();
  const { isSuccess: isApproveSuccess, isLoading: isApproveLoading } =
    useWaitForTransactionReceipt({
      hash: approveHash,
    });
  const { isSuccess: isDevolverSuccess, isLoading: isDevolverLoading } =
    useWaitForTransactionReceipt({
      hash: devolverHash,
    });

  const handleApproveAndReturnTokens = () => {
    if (!isNaN(numTokens) && numTokens > 0) {
      approveTokens({
        address: tokenAddress,
        abi: tokenAbi,
        functionName: "approve",
        args: [casinoAddress, numTokens],
        account: address,
      });
    } else {
      toast({
        title: "An error occurred",
        description: "Please enter a valid number",
        className: "bg-red-500",
      });
    }
  };

  useEffect(() => {
    if (isApproveSuccess) {
      devolverTokens({
        address: casinoAddress,
        abi: casinoAbi,
        functionName: "devolverTokens",
        args: [numTokens],
        account: address,
      });
    }
  }, [
    isApproveSuccess,
    numTokens,
    casinoAddress,
    casinoAbi,
    address,
    devolverTokens,
  ]);

  useEffect(() => {
    if (isDevolverSuccess) {
      setRefresh((prev) => !prev);
      setNumTokens("");
    }
  }, [isDevolverSuccess, setRefresh]);

  return (
    <div>
      <ToastManager
        hash={approveHash}
        isPending={isApprovePending}
        isLoading={isApproveLoading}
        isSuccess={isApproveSuccess}
        error={approveError}
        alertDescription="Approve Tokens"
      />
      <ToastManager
        hash={devolverHash}
        isPending={isDevolverPending}
        isLoading={isDevolverLoading}
        isSuccess={isDevolverSuccess}
        alertDescription="Return Tokens"
      />
      <h2 className="text-3xl text-purple-400 mb-2 font-extrabold">
        Return Tokens
      </h2>
      <input
        className="text-black w-full max-w-xs border border-gray-300 rounded-lg px-4 py-2 mb-2"
        type="number"
        value={numTokens}
        onChange={(e) => setNumTokens(e.target.value)}
        placeholder="Number of tokens"
      />
      <button
        className="bg-purple-400 border border-white rounded-lg px-4 py-2 mb-2 w-full max-w-xs"
        onClick={handleApproveAndReturnTokens}
        disabled={!numTokens || isApprovePending || isDevolverPending}
      >
        {isApprovePending || isDevolverPending ? "Processing..." : "Get Ether"}
      </button>
    </div>
  );
};

export default DevolverTokens;
