"use client";

import { useCallback, useState } from "react";

export type EthereumWalletStatus = "idle" | "connecting" | "connected" | "unsupported";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export function shortWalletAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function useEthereumWallet() {
  const [status, setStatus] = useState<EthereumWalletStatus>("idle");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async (): Promise<string | null> => {
    setError(null);
    if (!window.ethereum) {
      setStatus("unsupported");
      setError("Install a wallet like MetaMask or Rabby to connect.");
      return null;
    }

    try {
      setStatus("connecting");
      const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
      const account = accounts[0];
      if (!account) throw new Error("No wallet account returned.");
      setAddress(account);
      setStatus("connected");
      return account;
    } catch (e) {
      setStatus("idle");
      setError(e instanceof Error ? e.message : "Could not connect wallet.");
      return null;
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress("");
    setStatus("idle");
    setError(null);
  }, []);

  return {
    status,
    address,
    error,
    setError,
    connect,
    disconnect,
    isConnected: status === "connected" && Boolean(address),
  };
}
