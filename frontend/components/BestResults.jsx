import { useReadContract } from "wagmi";
import { useEffect } from "react";

const BestResults = ({ casinoAddress, casinoAbi, refresh }) => {
  const { data: biggestSingleWinEver, refetch: refetchBiggestSingleWinEver } =
    useReadContract({
      address: casinoAddress,
      abi: casinoAbi,
      functionName: "biggestSingleWinEver",
    });

  const { data: biggestTotalWinEver, refetch: refetchBiggestTotalWinEver } =
    useReadContract({
      address: casinoAddress,
      abi: casinoAbi,
      functionName: "biggestTotalWinEver",
    });

  useEffect(() => {
    refetchBiggestSingleWinEver();
    refetchBiggestTotalWinEver();
  }, [refresh]);

  return (
    <div className="text-1xl text-center w-full p-2 mb-5 border border-purple-300 rounded-xl bg-black">
      <h2 className="text-2xl text-purple-400">Best Results</h2>
      <div>
        <strong>Biggest Single Win Ever:</strong>{" "}
        {biggestSingleWinEver?.toString() || "Loading..."}
      </div>
      <div>
        <strong>Biggest Total Win Ever:</strong>{" "}
        {biggestTotalWinEver?.toString() || "Loading..."}
      </div>
    </div>
  );
};

export default BestResults;
