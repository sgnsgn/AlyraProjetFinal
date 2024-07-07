import { useReadContract } from "wagmi";

const BestResults = ({ casinoAddress, casinoAbi }) => {
  const { data: biggestSingleWinEver } = useReadContract({
    address: casinoAddress,
    abi: casinoAbi,
    functionName: "biggestSingleWinEver",
  });

  const { data: biggestTotalWinEver } = useReadContract({
    address: casinoAddress,
    abi: casinoAbi,
    functionName: "biggestTotalWinEver",
  });

  return (
    <div className="text-1xl text-center w-full p-2 mb-5 border border-purple-300 rounded-xl">
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
