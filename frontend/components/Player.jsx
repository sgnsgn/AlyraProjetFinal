import { useReadContract } from "wagmi";
import { useEffect, useState } from "react";

const Player = ({
  address,
  casinoAddress,
  casinoAbi,
  tokenAddress,
  tokenAbi,
}) => {
  const { data: playerData } = useReadContract({
    address: casinoAddress,
    abi: casinoAbi,
    functionName: "players",
    args: [address],
  });

  const { data: tokenBalance } = useReadContract({
    address: tokenAddress,
    abi: tokenAbi,
    functionName: "balanceOf",
    args: [address],
  });

  const [player, setPlayer] = useState(null);

  useEffect(() => {
    if (playerData) {
      setPlayer(playerData);
    }
  }, [playerData]);

  return (
    <div className="text-1xl text-center w-full p-2 mb-5 border border-purple-300 rounded-xl">
      <h2 className="text-2xl text-purple-400">Player Informations</h2>
      <div>
        <strong>Number of Tokens:</strong>{" "}
        {tokenBalance?.toString() || "Loading..."}
      </div>
      {console.log(playerData)}
      <div>
        <strong>Total Gains:</strong>{" "}
        {player ? player[0]?.toString() : "Loading..."}
      </div>
      <div>
        <strong>Biggest Win:</strong>{" "}
        {player ? player[1]?.toString() : "Loading..."}
      </div>
      <div>
        <strong>Number of Games Played:</strong>{" "}
        {player ? player[2]?.toString() : "Loading..."}
      </div>
      <div>
        <strong>Number of Games Won:</strong>{" "}
        {player ? player[3]?.toString() : "Loading..."}
      </div>
    </div>
  );
};

export default Player;
