"use client";
import { useState, useEffect } from "react";
import {
  contractCasinoAddress,
  contractCasinoAbi,
  contractTokenAddress,
  contractTokenAbi,
} from "@/constants";
import { useChainId, useReadContract } from "wagmi";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import BestResults from "./BestResults";
import Player from "./Player";
import BuyTokens from "./BuyTokens";
import DevolverTokens from "./DevolverTokens";
import Game1 from "./Game1";
import Game2 from "./Game2";
import SlotMachine from "./SlotMachine";
import SlotMachine2 from "./SlotMachine2";
import Events from "./Events";
import { parseAbiItem } from "viem";
import { publicClient } from "../utils/client";

const HARDHAT_EXPECTED_NETWORK_ID = 31337;
const SEPOLIA_EXPECTED_NETWORK_ID = 11155111;

const Casino = ({ address }) => {
  const [isOwner, setIsOwner] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [events, setEvents] = useState([]);
  const [result1, setResult1] = useState(null);
  const [spinning1, setSpinning1] = useState(false);
  const [result2, setResult2] = useState(null);
  const [spinning2, setSpinning2] = useState(false);
  const [playerWonEvent, setPlayerWonEvent] = useState(null);
  const [playerLostEvent, setPlayerLostEvent] = useState(null);
  const chainId = useChainId();

  const isOnExpectedNetwork =
    chainId === HARDHAT_EXPECTED_NETWORK_ID ||
    chainId === SEPOLIA_EXPECTED_NETWORK_ID;

  // Function to fetch events
  const getEvents = async () => {
    try {
      const playerBoughtTokensEvents = await publicClient.getLogs({
        address: contractCasinoAddress,
        event: parseAbiItem(
          "event PlayerBoughtTokens(address indexed player, uint256 amount)"
        ),
        fromBlock: 6303800n,
        toBlock: "latest",
        args: [address],
      });

      const randomWordsRequestedEvents = await publicClient.getLogs({
        address: contractCasinoAddress,
        event: parseAbiItem(
          "event RandomWordsRequested(uint256 indexed requestId,address indexed player,uint256 gameType,uint256 betAmount)"
        ),
        fromBlock: 6303800n,
        toBlock: "latest",
        args: [address],
      });

      const playerPlayedGameEvents = await publicClient.getLogs({
        address: contractCasinoAddress,
        event: parseAbiItem(
          "event PlayerPlayedGame(address indexed player, uint8 gameType, uint256 betAmount, uint256 winAmount)"
        ),
        fromBlock: 6303800n,
        toBlock: "latest",
      });

      const playerWonEvents = await publicClient.getLogs({
        address: contractCasinoAddress,
        event: parseAbiItem(
          "event PlayerWon(address indexed player,uint256 betAmount,uint256 winAmount)"
        ),
        fromBlock: 6303800n,
        toBlock: "latest",
      });

      const playerLostEvents = await publicClient.getLogs({
        address: contractCasinoAddress,
        event: parseAbiItem(
          "event PlayerLost(address indexed player, uint256 betAmount)"
        ),
        fromBlock: 6303800n,
        toBlock: "latest",
      });

      const playerWithdrewTokensEvents = await publicClient.getLogs({
        address: contractCasinoAddress,
        event: parseAbiItem(
          "event PlayerWithdrewTokens(address indexed player, uint256 amount)"
        ),
        fromBlock: 6303800n,
        toBlock: "latest",
      });

      const playerGetBackEthersEvents = await publicClient.getLogs({
        address: contractCasinoAddress,
        event: parseAbiItem(
          "event PlayerGetBackEthers(address indexed player, uint256 amount)"
        ),
        fromBlock: 6303800n,
        toBlock: "latest",
      });

      const playerBecameInactiveEvents = await publicClient.getLogs({
        address: contractCasinoAddress,
        event: parseAbiItem(
          "event PlayerBecameInactive(address indexed player)"
        ),
        fromBlock: 6303800n,
        toBlock: "latest",
      });

      // Function to combine events
      const combinedEvents = [
        ...playerBoughtTokensEvents.map((event) => ({
          type: "PlayerBoughtTokens",
          address: event.address,
          args: {
            player: event.args.player,
          },
          blockNumber: Number(event.blockNumber),
        })),
        ...randomWordsRequestedEvents.map((event) => ({
          type: "RandomWordsRequested",
          address: event.address,
          args: {
            player: event.args.player,
          },
          blockNumber: Number(event.blockNumber),
        })),
        ...playerPlayedGameEvents.map((event) => ({
          type: "PlayerPlayedGame",
          address: event.address,
          args: {
            player: event.args.player,
          },
          blockNumber: Number(event.blockNumber),
        })),
        ...playerWonEvents.map((event) => ({
          type: "PlayerWon",
          address: event.address,
          args: {
            player: event.args.player,
          },
          blockNumber: Number(event.blockNumber),
        })),
        ...playerLostEvents.map((event) => ({
          type: "PlayerLost",
          address: event.address,
          args: {
            player: event.args.player,
          },
          blockNumber: Number(event.blockNumber),
        })),
        ...playerWithdrewTokensEvents.map((event) => ({
          type: "PlayerWithdrewTokens",
          address: event.address,
          args: {
            player: event.args.player,
          },
          blockNumber: Number(event.blockNumber),
        })),
        ...playerGetBackEthersEvents.map((event) => ({
          type: "PlayerGetBackEthers",
          address: event.address,
          args: {
            player: event.args.player,
          },
          blockNumber: Number(event.blockNumber),
        })),
        ...playerBecameInactiveEvents.map((event) => ({
          type: "PlayerBecameInactive",
          address: event.address,
          args: {
            player: event.args.player,
          },
          blockNumber: Number(event.blockNumber),
        })),
      ];

      if (playerWonEvents.length > 0) {
        setPlayerWonEvent(playerWonEvents[playerWonEvents.length - 1]);
      }

      if (playerLostEvents.length > 0) {
        setPlayerLostEvent(playerLostEvents[playerLostEvents.length - 1]);
      }

      combinedEvents.sort((a, b) => b.blockNumber - a.blockNumber);

      setEvents(combinedEvents);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  useEffect(() => {
    if (isOnExpectedNetwork && address) {
      getEvents();
    }
  }, [isOnExpectedNetwork, address]);

  useEffect(() => {
    getEvents();
  }, [refresh]);

  const {
    data: ownerData,
    error: ownerError,
    isLoading: isOwnerLoading,
    isSuccess: isOwnerSuccess,
    refetch,
  } = useReadContract({
    address: contractCasinoAddress,
    abi: contractCasinoAbi,
    functionName: "owner",
  });

  useEffect(() => {
    if (ownerError) {
      setIsOwner(false);
    } else if (ownerData !== undefined && address) {
      setIsOwner(ownerData.toLowerCase() === address.toLowerCase());
    }
  }, [ownerData, ownerError, address]);

  if (!isOnExpectedNetwork) {
    return (
      <div>
        <Alert className="bg-gray-500 text-black p-5 text-center">
          <AlertTitle>NETWORK ERROR</AlertTitle>
          <AlertDescription>
            Please connect to the expected network.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-3/4 text-center items-center mx-auto">
      <div className="p-2 mb-5 border border-purple-300 rounded-xl bg-black">
        <div>
          Welcone on board to you :{" "}
          <span className="text-purple-400">{address}</span>
        </div>
        <div>
          You're actually on the network :{" "}
          <span className="text-purple-400">{chainId}</span>
        </div>
      </div>
      <BestResults
        casinoAddress={contractCasinoAddress}
        casinoAbi={contractCasinoAbi}
        refresh={refresh}
      />
      <Player
        address={address}
        tokenAddress={contractTokenAddress}
        tokenAbi={contractTokenAbi}
        casinoAddress={contractCasinoAddress}
        casinoAbi={contractCasinoAbi}
        refresh={refresh}
      />
      <div className="text-1xl text-center mb-3 w-full flex justify-center">
        <div className="w-1/3 p-2 mr-1 border border-purple-300 rounded-xl bg-black">
          <BuyTokens
            address={address}
            tokenAddress={contractTokenAddress}
            tokenAbi={contractTokenAbi}
            casinoAddress={contractCasinoAddress}
            casinoAbi={contractCasinoAbi}
            setRefresh={setRefresh}
          />
        </div>
        <div className="w-1/3 p-2 ml-1 border border-purple-300 rounded-xl bg-black">
          <DevolverTokens
            address={address}
            tokenAddress={contractTokenAddress}
            tokenAbi={contractTokenAbi}
            casinoAddress={contractCasinoAddress}
            casinoAbi={contractCasinoAbi}
            setRefresh={setRefresh}
          />
        </div>
      </div>
      <div className="text-1xl text-center w-full flex justify-center p-2 mb-5">
        <div className="w-1/2 p-2 mr-1 border border-purple-300 rounded-xl p-5 bg-black">
          <div>
            <Game1
              address={address}
              casinoAddress={contractCasinoAddress}
              casinoAbi={contractCasinoAbi}
              tokenAddress={contractTokenAddress}
              tokenAbi={contractTokenAbi}
              setRefresh={setRefresh}
              setSpinning={setSpinning1}
              setResult={setResult1}
              playerWonEvent={playerWonEvent}
              playerLostEvent={playerLostEvent}
            />
            <SlotMachine spinning={spinning1} result={result1} />
          </div>
          <p className="text-gray-400 italic">*1/9 chance of winning</p>
        </div>
        <div className="w-1/2 p-2 ml-1 border border-purple-300 rounded-xl p-5 bg-black">
          <div>
            <Game2
              address={address}
              casinoAddress={contractCasinoAddress}
              casinoAbi={contractCasinoAbi}
              tokenAddress={contractTokenAddress}
              tokenAbi={contractTokenAbi}
              setRefresh={setRefresh}
              setSpinning={setSpinning2}
              setResult={setResult2}
              playerWonEvent={playerWonEvent}
              playerLostEvent={playerLostEvent}
            />
            <SlotMachine2 spinning={spinning2} result={result2} />
          </div>
          <p className="text-gray-400 italic">*1/25 chance of winning</p>
        </div>
      </div>
      <div>
        {isOwner && (
          <Events events={events} refresh={refresh} getEvents={getEvents} />
        )}
      </div>
    </div>
  );
};

export default Casino;
