import {
  BetterDevPassportAbi,
  MeetupRegistryAbi,
  ReputationRegistryAbi,
} from "@/contracts/abis";
import { betterDevContractAddresses, areBetterDevContractsConfigured } from "@/contracts/config";
import { meetupIdToBytes32 } from "@/lib/contracts";
import { Contract, JsonRpcProvider, Wallet } from "ethers";

const MINT_GAS_LIMIT = 350_000;
const VERIFY_GAS_LIMIT = 350_000;
const CREATE_MEETUP_GAS_LIMIT = 350_000;

function requireRelayerConfig(): { rpcUrl: string; privateKey: string } {
  const rpcUrl = process.env.ARBITRUM_SEPOLIA_RPC_URL?.trim();
  const privateKey =
    process.env.ORGANIZER_PRIVATE_KEY?.trim() || process.env.DEPLOYER_PRIVATE_KEY?.trim();
  if (!rpcUrl || !privateKey) {
    throw new Error("Missing ORGANIZER_PRIVATE_KEY (or DEPLOYER_PRIVATE_KEY) or ARBITRUM_SEPOLIA_RPC_URL.");
  }
  if (!areBetterDevContractsConfigured()) {
    throw new Error("Contract addresses are not configured.");
  }
  return { rpcUrl, privateKey };
}

function getRelayerSigner(): Wallet {
  const { rpcUrl, privateKey } = requireRelayerConfig();
  return new Wallet(privateKey, new JsonRpcProvider(rpcUrl));
}

export function getRelayerPassportContract() {
  const signer = getRelayerSigner();
  return new Contract(betterDevContractAddresses.passport, BetterDevPassportAbi, signer);
}

export function getRelayerMeetupContract() {
  const signer = getRelayerSigner();
  return new Contract(betterDevContractAddresses.meetupRegistry, MeetupRegistryAbi, signer);
}

export function getRelayerReputationContract() {
  const signer = getRelayerSigner();
  return new Contract(betterDevContractAddresses.reputationRegistry, ReputationRegistryAbi, signer);
}

export function getReadOnlyProvider(): JsonRpcProvider {
  const rpcUrl = process.env.ARBITRUM_SEPOLIA_RPC_URL?.trim();
  if (!rpcUrl) {
    throw new Error("Missing ARBITRUM_SEPOLIA_RPC_URL.");
  }
  return new JsonRpcProvider(rpcUrl);
}

export function getReadOnlyPassportContract() {
  return new Contract(
    betterDevContractAddresses.passport,
    BetterDevPassportAbi,
    getReadOnlyProvider(),
  );
}

export function getReadOnlyMeetupContract() {
  return new Contract(
    betterDevContractAddresses.meetupRegistry,
    MeetupRegistryAbi,
    getReadOnlyProvider(),
  );
}

export function getReadOnlyReputationContract() {
  return new Contract(
    betterDevContractAddresses.reputationRegistry,
    ReputationRegistryAbi,
    getReadOnlyProvider(),
  );
}

export async function mintPassportForMember(
  walletAddress: string,
  communityId: string,
  metadataURI: string,
): Promise<{ mintTx: string; tokenId: number }> {
  const passport = getRelayerPassportContract();
  const tx = await passport.mintPassport(walletAddress, communityId, metadataURI, {
    gasLimit: MINT_GAS_LIMIT,
  });
  const receipt = await tx.wait();
  if (!receipt) throw new Error("Mint transaction failed.");

  const tokenId = Number(await passport.tokenIdOfMember(communityId));
  return { mintTx: receipt.hash, tokenId };
}

export async function verifyAttendanceForMember(
  meetupSlug: string,
  communityId: string,
  proofURI: string,
): Promise<{ attendanceTx: string }> {
  const meetup = getRelayerMeetupContract();
  const meetupId = meetupIdToBytes32(meetupSlug);
  const tx = await meetup.verifyAttendance(meetupId, communityId, proofURI, {
    gasLimit: VERIFY_GAS_LIMIT,
  });
  const receipt = await tx.wait();
  if (!receipt) throw new Error("Attendance verification transaction failed.");
  return { attendanceTx: receipt.hash };
}

export async function createMeetupIfNeeded(
  meetupSlug: string,
  metadataURI: string,
): Promise<{ created: boolean; txHash?: string }> {
  const meetup = getRelayerMeetupContract();
  const meetupId = meetupIdToBytes32(meetupSlug);

  try {
    await meetup.meetup(meetupId);
    return { created: false };
  } catch {
    const tx = await meetup.createMeetup(meetupId, metadataURI, { gasLimit: CREATE_MEETUP_GAS_LIMIT });
    const receipt = await tx.wait();
    return { created: true, txHash: receipt?.hash };
  }
}

export type MemberOnChainStatus = {
  passportMinted: boolean;
  tokenId: number;
  memberIdOnWallet: string;
  onChainReputation: number;
  hasAttended: boolean;
};

export async function readMemberOnChainStatus(
  communityId: string,
  meetupSlug: string,
  walletAddress?: string,
): Promise<MemberOnChainStatus> {
  if (!areBetterDevContractsConfigured()) {
    return {
      passportMinted: false,
      tokenId: 0,
      memberIdOnWallet: "",
      onChainReputation: 0,
      hasAttended: false,
    };
  }

  const passport = getReadOnlyPassportContract();
  const meetup = getReadOnlyMeetupContract();
  const reputation = getReadOnlyReputationContract();
  const meetupId = meetupIdToBytes32(meetupSlug);

  const [tokenIdRaw, onChainReputation, hasAttended] = await Promise.all([
    passport.tokenIdOfMember(communityId),
    reputation.reputationOf(communityId),
    meetup.hasAttended(meetupId, communityId),
  ]);

  const tokenId = Number(tokenIdRaw);
  let memberIdOnWallet = "";
  if (walletAddress) {
    memberIdOnWallet = String(await passport.memberIdOf(walletAddress));
  }

  return {
    passportMinted: tokenId > 0,
    tokenId,
    memberIdOnWallet,
    onChainReputation: Number(onChainReputation),
    hasAttended: Boolean(hasAttended),
  };
}

export async function readWalletPassportStatus(walletAddress: string): Promise<{
  minted: boolean;
  tokenId: number;
  memberId: string;
}> {
  const passport = getReadOnlyPassportContract();
  const [tokenIdRaw, memberId] = (await passport.passportOf(walletAddress)) as [bigint, string];
  const tokenId = Number(tokenIdRaw);
  return {
    minted: tokenId > 0,
    tokenId,
    memberId: String(memberId),
  };
}

export function encodeCommunityIdForMetadata(communityId: string): string {
  return encodeURIComponent(communityId);
}

export function decodeCommunityIdFromMetadata(param: string): string {
  return decodeURIComponent(param);
}
