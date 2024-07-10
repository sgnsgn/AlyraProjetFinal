import React, { useState, useEffect } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
} from "wagmi";
import { useToast } from "./ui/use-toast";
import ToastManager from "./ToastManager";
import "../app/blink.css";

const Game1 = ({
  address,
  casinoAddress,
  casinoAbi,
  tokenAddress,
  tokenAbi,
  setRefresh,
  setSpinning,
  setResult,
}) => {
  const [betAmount, setBetAmount] = useState("");
  const [approveSuccess, setApproveSuccess] = useState(false);
  const { toast } = useToast();

  const {
    data: approveHash,
    isPending: isApprovePending,
    writeContract: approveTokens,
    error: approveError,
  } = useWriteContract();

  const {
    data: playGameHash,
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
      hash: playGameHash,
    });

  useWatchContractEvent({
    address: casinoAddress,
    abi: casinoAbi,
    eventName: "PlayerWon",
    onLogs(logs) {
      setResult({ won: true, logs });
      setSpinning(false);
    },
  });

  useWatchContractEvent({
    address: casinoAddress,
    abi: casinoAbi,
    eventName: "PlayerLost",
    onLogs(logs) {
      setResult({ won: false, logs });
      setSpinning(false);
    },
  });

  const handleApprove = async () => {
    if (!isNaN(betAmount) && betAmount > 0) {
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
      try {
        setSpinning(true);
        setResult(null);
        playGame({
          address: casinoAddress,
          abi: casinoAbi,
          functionName: "playGame",
          args: [1, betAmount],
          account: address,
        });
      } catch (error) {
        console.error("Error in playGame:", error);
        toast({
          title: "Transaction failed",
          description: error.message,
          className: "bg-red-500",
        });
        setSpinning(false);
      }
    }
  };

  useEffect(() => {
    if (isApproveSuccess) {
      setApproveSuccess(true);
      toast({
        title: "Approval successful",
        description: "You can now play the game",
        className: "bg-[#0E0C09]",
      });
    }
  }, [isApproveSuccess, toast]);

  useEffect(() => {
    if (isPlaySuccess) {
      setApproveSuccess(false);
      setRefresh((prev) => !prev);
      setBetAmount("");
      setSpinning(false);
    }
  }, [isPlaySuccess, setRefresh]);

  useEffect(() => {
    if (playError) {
      setApproveSuccess(false);
      setRefresh((prev) => !prev);
      setBetAmount("");
      setSpinning(false);
    }
  }, [playError]);

  return (
    <div>
      <h2 className="text-4xl text-purple-400 mb-1 font-extrabold">
        SPIN THE GAME ONE
      </h2>
      <p className="text-lg text-gray-400 mb-1">
        3 rolls, 3 patterns (🚀, 🔥, 💎)
      </p>
      <p className="text-lg text-gray-400 mb-4 italic">The bet minimum is 1</p>
      <p className="text-3xl text-yellow-400 mb-7 blink font-extrabold">
        Win multiplier x 7
      </p>
      <input
        className="text-black w-full max-w-xs border border-gray-300 rounded-lg px-4 py-2 mb-2"
        type="number"
        value={betAmount}
        onChange={(e) => setBetAmount(e.target.value)}
        placeholder="Enter bet amount"
      />
      <button
        className={`bg-purple-400 border border-white rounded-lg px-4 py-2 w-full max-w-xs ${
          isApproveLoading || !betAmount || approveSuccess
            ? "opacity-50 cursor-not-allowed"
            : ""
        }`}
        onClick={handleApprove}
        disabled={!betAmount || isApproveLoading || approveSuccess}
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
      <ToastManager
        hash={approveHash}
        isPending={isApprovePending}
        isLoading={isApproveLoading}
        isSuccess={isApproveSuccess}
        error={approveError}
        alertDescription="Approve Tokens"
      />
      <ToastManager
        hash={playGameHash}
        isPending={isPlayPending}
        isLoading={isPlayLoading}
        isSuccess={isPlaySuccess}
        error={playError}
        alertDescription="Play Game"
      />
    </div>
  );
};

export default Game1;
