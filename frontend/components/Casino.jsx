"use client";
import { useState } from "react";
import { useChainId } from "wagmi";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
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
    <div className="text-1xl text-center p-5">
      <div>
        Welcone on board to you : <span>{address}</span>
      </div>
      <div>
        You're actually on <span>{chainId}</span>
      </div>
    </div>
  );
};

export default Casino;
