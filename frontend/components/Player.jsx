import { useReadContract } from "wagmi";
import { useEffect } from "react";

const Player = ({
  address,
  casinoAddress,
  casinoAbi,
  tokenAddress,
  tokenAbi,
  refresh,
  lastUpdate,
}) => {
  const { data: playerData, refetch: refetchPlayerData } = useReadContract({
    address: casinoAddress,
    abi: casinoAbi,
    functionName: "players",
    args: [address],
  });

  const { data: tokenBalance, refetch: refetchTokenBalance } = useReadContract({
    address: tokenAddress,
    abi: tokenAbi,
    functionName: "balanceOf",
    args: [address],
  });

  useEffect(() => {
    refetchPlayerData();
    refetchTokenBalance();
  }, [lastUpdate]);

  useEffect(() => {
    refetchPlayerData();
    refetchTokenBalance();
  }, [refresh]);

  return (
    <div className="text-1xl text-center w-full p-2 mb-5 border border-purple-300 rounded-xl bg-black">
      <h2 className="text-2xl text-purple-400 font-extrabold">
        Player Informations
      </h2>
      <div>
        <strong>Number of Tokens:</strong>{" "}
        {tokenBalance?.toString() || "Loading..."}
      </div>
      <div>
        <strong>Total Gains:</strong>{" "}
        {playerData ? playerData[0]?.toString() : "Loading..."}
      </div>
      <div>
        <strong>Biggest Win:</strong>{" "}
        {playerData ? playerData[1]?.toString() : "Loading..."}
      </div>
      <div>
        <strong>Number of Games Played:</strong>{" "}
        {playerData ? playerData[2]?.toString() : "Loading..."}
      </div>
      <div>
        <strong>Number of Games Won:</strong>{" "}
        {playerData ? playerData[3]?.toString() : "Loading..."}
      </div>
    </div>
  );
};

export default Player;
