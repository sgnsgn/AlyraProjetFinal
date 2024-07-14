import React, { useState, useEffect } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
} from "wagmi";
import { useToast } from "./ui/use-toast";
import ToastManager from "./ToastManager";
import "../app/blink.css";

const Game2 = ({
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
    error: approveError,
    writeContract: approveTokens,
  } = useWriteContract();

  const {
    data: playGameHash,
    isPending: isPlayPending,
    error: playError,
    writeContract: playGame,
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
    async onLogs(logs) {
      await handleContractEvent(logs, "PlayerWon");
      setRefresh((prev) => !prev);
    },
  });

  useWatchContractEvent({
    address: casinoAddress,
    abi: casinoAbi,
    eventName: "PlayerLost",
    async onLogs(logs) {
      await handleContractEvent(logs, "PlayerLost");
      setRefresh((prev) => !prev);
    },
  });

  const handleApprove = async () => {
    if (isNaN(betAmount) || betAmount < 3) {
      toast({
        title: "Invalid number",
        description: "Please enter a number greater than or equal to 3.",
        className: "bg-red-500",
      });
    } else if (betAmount % 3 !== 0) {
      toast({
        title: "Invalid number",
        description: "The number must be a multiple of 3.",
        className: "bg-red-500",
      });
    } else {
      approveTokens({
        address: tokenAddress,
        abi: tokenAbi,
        functionName: "approve",
        args: [casinoAddress, betAmount],
        account: address,
      });
    }
  };

  const handlePlayGame = async () => {
    if (approveSuccess) {
      try {
        setResult(null);
        playGame({
          address: casinoAddress,
          abi: casinoAbi,
          functionName: "playGame",
          args: [2, betAmount],
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

  const handleContractEvent = async (logs, eventType) => {
    // Mise à jour de l'état
    setResult({ won: eventType === "PlayerWon", logs });
    setSpinning(false);
    setRefresh((prev) => !prev);
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
    if (isPlayLoading) {
      setSpinning(true);
      setApproveSuccess(false);
      setBetAmount("");
    }
  }, [isPlayLoading]);

  useEffect(() => {
    if (playError) {
      setApproveSuccess(false);
      setRefresh((prev) => !prev);
      setBetAmount("");
      setSpinning(false);
    }
  }, [playError]);

  const handleIncrement = () => {
    setBetAmount((prevAmount) => (prevAmount ? Number(prevAmount) + 3 : 3));
  };

  const handleDecrement = () => {
    setBetAmount((prevAmount) =>
      prevAmount && prevAmount >= 3 ? Number(prevAmount) - 3 : 0
    );
  };

  return (
    <div>
      <h2 className="text-4xl text-purple-400 mb-1 font-extrabold">
        SPIN THE GAME TWO
      </h2>
      <p className="text-lg text-gray-400 mb-1">
        3 rolls, 5 patterns (🌕, 💰, 🪙, 📈, 🎰)
      </p>
      <p className="text-lg text-gray-400 mb-4 italic">
        The bet must be a multiple of 3
      </p>
      <p className="text-3xl text-yellow-400 mb-7 blink font-extrabold">
        Win multiplier x 20
      </p>
      <div className="flex items-center justify-center mb-2">
        <button
          className="bg-gray-300 border border-gray-400 rounded-l-lg px-2 py-2 mb-2"
          onClick={handleDecrement}
        >
          -3
        </button>
        <input
          className="text-black w-full max-w-xs border border-gray-300 rounded-none px-4 py-2 mb-2"
          // type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          placeholder="Enter bet amount"
        />
        <button
          className="bg-gray-300 border border-gray-400 rounded-r-lg px-2 py-2 mb-2"
          onClick={handleIncrement}
        >
          +3
        </button>
      </div>
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
        isLoading={isApproveLoading}
        isPending={isApprovePending}
        isSuccess={isApproveSuccess}
        error={approveError}
        alertDescription="Token approval"
      />
      <ToastManager
        hash={playGameHash}
        isLoading={isPlayLoading}
        isPending={isPlayPending}
        isSuccess={isPlaySuccess}
        error={playError}
        alertDescription="Game play"
      />
    </div>
  );
};

export default Game2;
