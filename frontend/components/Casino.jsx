"use client";
import { useState, useEffect } from "react";
import {
  contractCasinoAddress,
  contractCasinoAbi,
  contractTokenAddress,
  contractTokenAbi,
} from "@/constants";
import { useChainId } from "wagmi";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import BestResults from "./BestResults";
import Player from "./Player";
import BuyTokens from "./BuyTokens";
import DevolverTokens from "./DevolverTokens";
import Game1 from "./Game1";
import Game2 from "./Game2";
import SlotMachine from "./SlotMachine";
// Permet de parser l'event
//import { parseAbiItem } from "viem";
// On importe le publicClient créé (voir ce fichier pour avoir les commentaires sur ce que fait réellement ce publicClient)
// import { publicClient } from "../utils/client";

const HARDHAT_EXPECTED_NETWORK_ID = 31337;
const SEPOLIA_EXPECTED_NETWORK_ID = 11155111;

const Casino = ({ address }) => {
  const [isOwner, setIsOwner] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const chainId = useChainId();
  const isOnExpectedNetwork =
    chainId === HARDHAT_EXPECTED_NETWORK_ID ||
    chainId === SEPOLIA_EXPECTED_NETWORK_ID;

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
    <div className="text-1xl text-center p-1">
      <div className="p-2 mb-5 border border-purple-300 rounded-xl">
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
      />
      <Player
        address={address}
        tokenAddress={contractTokenAddress}
        tokenAbi={contractTokenAbi}
        casinoAddress={contractCasinoAddress}
        casinoAbi={contractCasinoAbi}
        refresh={refresh}
      />
      <div className="text-1xl text-center p-5 w-full flex justify-center">
        <div className="w-1/4 p-2 mr-1 border border-purple-300 rounded-xl">
          <BuyTokens
            address={address}
            tokenAddress={contractTokenAddress}
            tokenAbi={contractTokenAbi}
            casinoAddress={contractCasinoAddress}
            casinoAbi={contractCasinoAbi}
            setRefresh={setRefresh}
          />
        </div>
        <div className="w-1/4 p-2 ml-1 border border-purple-300 rounded-xl">
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
      <div className="text-1xl text-center p-5 w-full flex justify-center p-2 mb-5 border border-purple-300 rounded-xl">
        <div>
          <Game1
            address={address}
            tokenAddress={contractTokenAddress}
            tokenAbi={contractTokenAbi}
            casinoAddress={contractCasinoAddress}
            casinoAbi={contractCasinoAbi}
            setRefresh={setRefresh}
          />
        </div>
        <div>
          <Game2
            address={address}
            tokenAddress={contractTokenAddress}
            tokenAbi={contractTokenAbi}
            casinoAddress={contractCasinoAddress}
            casinoAbi={contractCasinoAbi}
            setRefresh={setRefresh}
          />
        </div>
      </div>
      <SlotMachine />
    </div>
  );
};

export default Casino;
