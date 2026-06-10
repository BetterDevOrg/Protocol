import { areBetterDevContractsConfigured, betterDevContractAddresses } from "@/contracts/config";
import { BuilderCircleVRFAbi } from "@/contracts/abis";
import { PASSPORT_NETWORK } from "@/lib/passport";
import { BrowserProvider, Contract, id } from "ethers";

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

export function transactionExplorerUrl(hash: string): string {
  return `https://sepolia.arbiscan.io/tx/${hash}`;
}

export function meetupIdToBytes32(meetupId: string): string {
  return id(meetupId);
}

export async function getBrowserProvider() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Install a wallet like MetaMask or Rabby to use live contracts.");
  }

  return new BrowserProvider(window.ethereum);
}

export async function ensureArbitrumSepolia() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Install a wallet like MetaMask or Rabby to use live contracts.");
  }

  const chainIdHex = PASSPORT_NETWORK.chainIdHex;
  const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
  if (currentChainId === chainIdHex) return;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? (error as { code?: number }).code : undefined;
    if (code !== 4902) throw error;

    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: chainIdHex,
          chainName: PASSPORT_NETWORK.name,
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: ["https://sepolia-rollup.arbitrum.io/rpc"],
          blockExplorerUrls: ["https://sepolia.arbiscan.io"],
        },
      ],
    });
  }
}

export async function getBuilderCircleVrfContract() {
  const address = betterDevContractAddresses.builderCircleVrf;
  if (!address) {
    throw new Error("BuilderCircleVRF address is not configured.");
  }

  await ensureArbitrumSepolia();
  const provider = await getBrowserProvider();
  const signer = await provider.getSigner();
  return new Contract(address, BuilderCircleVRFAbi, signer);
}
