import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { useToast } from "./ui/use-toast";
import ToastManager from "./ToastManager";

const BuyTokens = ({ address, casinoAddress, casinoAbi, setRefresh }) => {
  const [numTokens, setNumTokens] = useState("");
  const { toast } = useToast();

  const {
    data: hash,
    isPending,
    writeContract: buyTokens,
    error,
  } = useWriteContract();

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleChange = (event) => {
    setNumTokens(event.target.value);
  };

  const handleBuyTokens = () => {
    if (!isNaN(numTokens) && numTokens >= 10) {
      buyTokens({
        address: casinoAddress,
        abi: casinoAbi,
        functionName: "buyTokens",
        args: [numTokens],
        value: parseEther((numTokens * 0.00003).toString()),
        account: address,
      });
    } else {
      toast({
        title: "An error occured",
        description: "Please enter a valid number, greater than or equal to 10",
        className: "bg-red-500",
      });
    }
  };

  useEffect(() => {
    if (isSuccess) {
      setRefresh((prev) => !prev);
      setNumTokens("");
    }
  }, [isSuccess, setRefresh]);

  return (
    <div>
      <ToastManager
        hash={hash}
        isPending={isPending}
        isLoading={isLoading}
        isSuccess={isSuccess}
        error={error}
        alertDescription={"Buy Tokens"}
      />
      <h2 className="text-3xl font-extrabold text-purple-400 mb-2">
        Buy Tokens{" "}
        <span className="text-gray-400 text-lg">(min 10 tokens)</span>
      </h2>
      <input
        className="text-black w-full max-w-xs border border-gray-300 rounded-lg px-4 py-2 mb-2"
        type="number"
        value={numTokens}
        onChange={handleChange}
        placeholder="Enter number of tokens"
      />
      <button
        className="bg-purple-400 border border-white rounded-lg px-4 py-2 mx-2 w-full max-w-xs"
        onClick={handleBuyTokens}
        disabled={!numTokens || isPending || isLoading}
      >
        {isPending ? "Processing..." : "Get $NADC"}
      </button>
    </div>
  );
};

export default BuyTokens;
