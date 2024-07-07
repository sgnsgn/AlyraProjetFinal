import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { useToast } from "./ui/use-toast";

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
  const { isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });
  const { isSuccess: isDevolverSuccess } = useWaitForTransactionReceipt({
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
    }
  }, [isDevolverSuccess, setRefresh]);

  return (
    <div>
      <h2 className="text-2xl text-purple-400 mb-2">Return Tokens</h2>
      <input
        className="text-black w-full max-w-xs border border-gray-300 rounded-lg px-4 py-2 mb-2"
        type="number"
        value={numTokens}
        onChange={(e) => setNumTokens(e.target.value)}
        placeholder="Number of tokens"
      />
      <button
        className="bg-purple-400 border border-white rounded-lg px-4 py-2 mt-2 w-full max-w-xs"
        onClick={handleApproveAndReturnTokens}
        disabled={!numTokens || isApprovePending || isDevolverPending}
      >
        {isApprovePending || isDevolverPending
          ? "Processing..."
          : "Return Tokens"}
      </button>
      {approveHash && (
        <div className="mt-2 text-white">
          <p>Approval Transaction Hash: {approveHash}</p>
          {approveError && <p className="text-red-500">Error in approval</p>}
        </div>
      )}
      {devolverHash && (
        <div className="mt-2 text-white">
          <p>Return Transaction Hash: {devolverHash}</p>
          {devolverError ? (
            <p className="text-red-500">Error in return transaction</p>
          ) : (
            <p className="text-green-500">Return transaction successful</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DevolverTokens;
