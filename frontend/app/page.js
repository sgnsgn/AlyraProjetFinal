"use client";
import Casino from "@/components/Casino";
import NotConnected from "@/components/NotConnected";
import Disclaimer from "@/components/Disclaimer";
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";

export default function Home() {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  useEffect(() => {
    const isAccepted = localStorage.getItem("disclaimerAccepted");
    if (isAccepted === "true") {
      setDisclaimerAccepted(true);
    }
  }, []);

  const handleAcceptDisclaimer = () => {
    setDisclaimerAccepted(true);
    localStorage.setItem("disclaimerAccepted", "true");
  };

  const { address, isConnected } = useAccount();

  return (
    <>
      {!disclaimerAccepted ? (
        <Disclaimer onAccept={handleAcceptDisclaimer} />
      ) : isConnected ? (
        <Casino address={address} />
      ) : (
        <NotConnected />
      )}
    </>
  );
}
