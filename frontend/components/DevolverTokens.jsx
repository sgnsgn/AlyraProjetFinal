import { useState } from "react";
import { useWriteContract } from "wagmi";

const DevolverTokens = ({
  address,
  casinoAddress,
  casinoAbi,
  tokenAddress,
  tokenAbi,
}) => {
  const [numTokens, setNumTokens] = useState(0);
  const [error, setError] = useState(null);

  const { writeContract: approveTokens } = useWriteContract({
    address: tokenAddress,
    abi: tokenAbi,
    functionName: "approve",
    args: [casinoAddress, numTokens],
  });

  const { writeContract: devolverTokens } = useWriteContract({
    address: casinoAddress,
    abi: casinoAbi,
    functionName: "devolverTokens",
    args: [numTokens],
  });

  const handleApproveAndReturnTokens = async () => {
    try {
      await approveTokens();
      await devolverTokens();
    } catch (err) {
      setError(err.message);
    }
  };

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
      >
        Return Tokens
      </button>
      {error && <div className="text-red-500 mt-2">Error: {error}</div>}
    </div>
  );
};

export default DevolverTokens;
