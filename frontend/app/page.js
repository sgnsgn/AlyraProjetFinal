"use client";
import Casino from "@/components/Casino";
import NotConnected from "@/components/NotConnected";

import { useAccount } from "wagmi";

export default function Home() {
  const { address, isConnected } = useAccount();
  return <>{isConnected ? <Casino address={address} /> : <NotConnected />}</>;
}
