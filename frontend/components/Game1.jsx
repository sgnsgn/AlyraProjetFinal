import { useState, useEffect } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
} from "wagmi";
import { useToast } from "./ui/use-toast";

const Game1 = ({
  address,
  casinoAddress,
  casinoAbi,
  tokenAddress,
  tokenAbi,
  setRefresh,
}) => {
  const [betAmount, setBetAmount] = useState("");
  const [approveSuccess, setApproveSuccess] = useState(false);
  const { toast } = useToast();

  // PlayerWon(msg.sender, betAmount, winAmount);
  // PlayerLost(msg.sender, betAmount);
  // PlayerPlayedGame(msg.sender, gameType, betAmount, winAmount);

  const onPlayerWon = useWatchContractEvent({
    address: casinoAddress,
    abi: casinoAbi,
    eventName: "PlayerWon",
    onLogs(logs) {
      console.log("New logs!", logs);
    },
  });

  const onPlayerLost = useWatchContractEvent({
    address: casinoAddress,
    abi: casinoAbi,
    eventName: "PlayerLost",
    onLogs(logs) {
      console.log("New logs!", logs);
    },
  });

  const onPlayerPlayed = useWatchContractEvent({
    address: casinoAddress,
    abi: casinoAbi,
    eventName: "PlayerPlayedGame",
    onLogs(logs) {
      console.log("New logs!", logs);
    },
  });

  const {
    data: approveHash,
    isPending: isApprovePending,
    writeContract: approveTokens,
    error: approveError,
  } = useWriteContract();

  const {
    data: playHash,
    isPending: isPlayPending,
    writeContract: playGame,
    error: playError,
  } = useWriteContract();

  const { isSuccess: isApproveSuccess, isLoading: isApproveLoading } =
    useWaitForTransactionReceipt({
      hash: approveHash,
    });

  const { isSuccess: isPlaySuccess, isLoading: isPlayLoading } =
    useWaitForTransactionReceipt({
      hash: playHash,
    });

  const handleApprove = async () => {
    if (!isNaN(betAmount) && betAmount > 0) {
      console.log("Approving tokens...");
      console.log("betAmount: ", betAmount);
      approveTokens({
        address: tokenAddress,
        abi: tokenAbi,
        functionName: "approve",
        args: [casinoAddress, betAmount],
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

  const handlePlayGame = async () => {
    if (approveSuccess) {
      console.log("Playing game...");
      console.log("betAmount: ", betAmount);
      try {
        playGame({
          address: casinoAddress,
          abi: casinoAbi,
          functionName: "playGame",
          args: [1, betAmount],
          account: address,
        });
        onPlayerLost;
        onPlayerWon;
        onPlayerPlayed;
      } catch (error) {
        console.error("Error in playGame:", error);
        toast({
          title: "Transaction failed",
          description: error.message,
          className: "bg-red-500",
        });
      }
    } else {
      toast({
        title: "Approval needed",
        description: "Please approve the tokens first",
        className: "bg-yellow-500",
      });
    }
  };

  useEffect(() => {
    if (isApproveSuccess) {
      setApproveSuccess(true);
      toast({
        title: "Approval successful",
        description: "You can now play the game",
        className: "bg-green-500",
      });
    }
  }, [isApproveSuccess, toast]);

  useEffect(() => {
    if (isPlaySuccess) {
      setRefresh((prev) => !prev);
      setBetAmount("");
    }
  }, [isPlaySuccess, setRefresh]);

  return (
    <div>
      <h2 className="text-2xl text-purple-400 mb-2">Game 1</h2>
      <input
        className="text-black w-full max-w-xs border border-gray-300 rounded-lg px-4 py-2 mb-2"
        type="number"
        value={betAmount}
        onChange={(e) => setBetAmount(e.target.value)}
        placeholder="Enter bet amount"
      />
      <button
        className={`bg-purple-400 border border-white rounded-lg px-4 py-2 w-full max-w-xs ${
          isApproveLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={handleApprove}
        disabled={!betAmount || isApproveLoading}
      >
        {isApproveLoading ? "Processing..." : "Approve"}
      </button>
      <button
        className={`bg-purple-400 border border-white rounded-lg px-4 py-2 mt-2 w-full max-w-xs ${
          !approveSuccess || isPlayLoading
            ? "opacity-50 cursor-not-allowed"
            : ""
        }`}
        onClick={handlePlayGame}
        disabled={!approveSuccess || isPlayLoading}
      >
        {isPlayLoading ? "Processing..." : "Play Game"}
      </button>
      {isApproveSuccess && (
        <div className="mt-2 text-white">
          <p>Approve Transaction Hash: {approveHash}</p>
        </div>
      )}
      {isPlaySuccess && (
        <div className="mt-2 text-white">
          <p>Play Transaction Hash: {playHash}</p>
          {playError ? (
            <p className="text-red-500">
              Error in play transaction: {playError.message}
            </p>
          ) : (
            <p className="text-green-500">Play transaction successful</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Game1;
