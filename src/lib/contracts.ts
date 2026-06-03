import { areBetterDevContractsConfigured, betterDevContractAddresses } from "@/contracts/config";
import { PASSPORT_NETWORK } from "@/lib/passport";

export const BETTERDEV_CONTRACTS = {
  chainId: PASSPORT_NETWORK.chainId,
  chainName: PASSPORT_NETWORK.name,
  explorerBaseUrl: "https://sepolia.arbiscan.io/address",
  addresses: betterDevContractAddresses,
} as const;

export function getBetterDevContractStatus() {
  const configured = areBetterDevContractsConfigured();

  return {
    configured,
    mode: configured ? "contracts-ready" : "demo-fallback",
    addresses: betterDevContractAddresses,
  } as const;
}

export function contractExplorerUrl(address: string): string {
  return `${BETTERDEV_CONTRACTS.explorerBaseUrl}/${address}`;
}
