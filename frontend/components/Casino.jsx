"use client";
import { useState, useEffect } from "react";
import {
  contractCasinoAddress,
  contractCasinoAbi,
  contractTokenAddress,
  contractTokenAbi,
} from "@/constants";
/*
useReadContract : Lire les données d'un contrat
useWriteContract : Ecrire des données dans un contrat
useWaitForTransactionReceipt : Attendre que la transaction soit confirmée (équivalent de transaction.wait() avec ethers)
useWatchContractEvent : Récupérer en temps réel si un évènement a été émis
*/
import {
  useChainId,
  useReadContract,
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
} from "wagmi";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import BestResults from "./BestResults";
import Player from "./Player";
import BuyTokens from "./BuyTokens";
import DevolverTokens from "./DevolverTokens";
import SlotMachine from "./SlotMachine";
// Permet de parser l'event
//import { parseAbiItem } from "viem";
// On importe le publicClient créé (voir ce fichier pour avoir les commentaires sur ce que fait réellement ce publicClient)
// import { publicClient } from "../utils/client";

const HARDHAT_EXPECTED_NETWORK_ID = 31337;
const SEPOLIA_EXPECTED_NETWORK_ID = 11155111;

const Casino = ({ address }) => {
  const [isOwner, setIsOwner] = useState(false);

  const chainId = useChainId(); // Utiliser useChainId pour obtenir l'ID de la chaine
  // Vérifier si nous sommes sur le bon réseau
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
      />
      <div className="text-1xl text-center p-5 w-full flex justify-center">
        <div className="w-1/4 p-2 mr-1 border border-purple-300 rounded-xl">
          <BuyTokens
            address={address}
            tokenAddress={contractTokenAddress}
            tokenAbi={contractTokenAbi}
            casinoAddress={contractCasinoAddress}
            casinoAbi={contractCasinoAbi}
          />
        </div>
        <div className="w-1/4 p-2 ml-1 border border-purple-300 rounded-xl">
          <DevolverTokens
            address={address}
            tokenAddress={contractTokenAddress}
            tokenAbi={contractTokenAbi}
            casinoAddress={contractCasinoAddress}
            casinoAbi={contractCasinoAbi}
          />
        </div>
      </div>
      <SlotMachine />
    </div>
  );
};

export default Casino;
