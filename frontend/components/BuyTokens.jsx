import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { useToast } from "./ui/use-toast";

const BuyTokens = ({ address, casinoAddress, casinoAbi }) => {
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

  const handleClick = async () => {
    if (!isNaN(numTokens) && numTokens >= 10) {
      buyTokens({
        address: casinoAddress,
        abi: casinoAbi,
        functionName: "buyTokens",
        args: [numTokens],
        value: parseEther((numTokens * 0.00003).toString()),
      });
    } else {
      toast({
        title: "An error occured",
        description: "Please enter a valid number, greater than or equal to 10",
        className: "bg-red-500",
      });
    }
  };

  return (
    <div>
      <h2 className="text-2xl text-purple-400 mb-2">Buy Tokens</h2>
      <input
        className="text-black w-full max-w-xs border border-gray-300 rounded-lg px-4 py-2 mb-2"
        type="number"
        value={numTokens}
        onChange={handleChange}
        placeholder="Enter number of tokens"
      />
      <button
        className="bg-purple-400 border border-white rounded-lg px-4 py-2 mt-2 w-full max-w-xs"
        onClick={handleClick}
        disabled={!numTokens || isPending || isLoading}
      >
        {isPending ? "Processing..." : "Buy Tokens"}
      </button>
      {error && <p className="text-red-500">{error.message}</p>}
      {isLoading ? (
        <p className="text-orange-500">Transaction is Loading...</p>
      ) : (
        isSuccess && (
          <div className="mt-2 text-white">
            <p>Transaction Hash: {hash}</p>
            <p className="text-green-500">Transaction successful</p>
          </div>
        )
      )}
    </div>
  );
};

export default BuyTokens;
