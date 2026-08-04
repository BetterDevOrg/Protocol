import {
  BetterDevPassportAbi,
  BuilderCircleVRFAbi,
  MeetupPassportAbi,
  MeetupRegistryAbi,
  OrganizerCodeVRFAbi,
  ReputationRegistryAbi,
} from "@/contracts/abis";
import { betterDevContractAddresses, areBetterDevContractsConfigured, isMeetupPassportConfigured } from "@/contracts/config";
import { meetupIdToBytes32 } from "@/lib/contracts";
import { organizerIdToBytes32 } from "@/lib/organizer-code";
import { Contract, JsonRpcProvider, Wallet } from "ethers";

const MINT_GAS_LIMIT = 350_000;
const VERIFY_GAS_LIMIT = 350_000;
const CREATE_MEETUP_GAS_LIMIT = 350_000;
const BUILDER_CIRCLE_VRF_GAS_LIMIT = 350_000;
const ORGANIZER_CODE_VRF_GAS_LIMIT = 350_000;

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

export function getRelayerSigner(): Wallet {
  const { rpcUrl, privateKey } = requireRelayerConfig();
  return new Wallet(privateKey, new JsonRpcProvider(rpcUrl));
}

export function getRelayerPassportContract() {
  const signer = getRelayerSigner();
  return new Contract(betterDevContractAddresses.passport, BetterDevPassportAbi, signer);
}

export function getRelayerMeetupPassportContract() {
  const signer = getRelayerSigner();
  return new Contract(betterDevContractAddresses.meetupPassport, MeetupPassportAbi, signer);
}

export function getReadOnlyMeetupPassportContract() {
  return new Contract(
    betterDevContractAddresses.meetupPassport,
    MeetupPassportAbi,
    getReadOnlyProvider(),
  );
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

export function getReadOnlyBuilderCircleVrfContract() {
  return new Contract(
    betterDevContractAddresses.builderCircleVrf,
    BuilderCircleVRFAbi,
    getReadOnlyProvider(),
  );
}

export function getRelayerBuilderCircleVrfContract() {
  const signer = getRelayerSigner();
  return new Contract(betterDevContractAddresses.builderCircleVrf, BuilderCircleVRFAbi, signer);
}

export async function readMeetupVrfSeed(meetupSlug: string): Promise<{
  seed: bigint;
  fulfilled: boolean;
}> {
  const vrf = getReadOnlyBuilderCircleVrfContract();
  const meetupId = meetupIdToBytes32(meetupSlug);
  const [seed, fulfilled] = (await vrf.getMeetupSeed(meetupId)) as [bigint, boolean];
  return { seed, fulfilled };
}

export async function requestMeetupVrfSeed(meetupSlug: string): Promise<{ requestTx: string }> {
  const vrf = getRelayerBuilderCircleVrfContract();
  const meetupId = meetupIdToBytes32(meetupSlug);
  const tx = await vrf.requestBuilderCircleRandomness(meetupId, {
    gasLimit: BUILDER_CIRCLE_VRF_GAS_LIMIT,
  });
  const receipt = await tx.wait();
  if (!receipt) throw new Error("VRF request transaction failed.");
  return { requestTx: receipt.hash };
}

export function getReadOnlyOrganizerCodeVrfContract() {
  return new Contract(
    betterDevContractAddresses.organizerCodeVrf,
    OrganizerCodeVRFAbi,
    getReadOnlyProvider(),
  );
}

export function getRelayerOrganizerCodeVrfContract() {
  const signer = getRelayerSigner();
  return new Contract(betterDevContractAddresses.organizerCodeVrf, OrganizerCodeVRFAbi, signer);
}

export async function readOrganizerCodeVrfSeed(organizerId: string): Promise<{
  seed: bigint;
  fulfilled: boolean;
}> {
  const vrf = getReadOnlyOrganizerCodeVrfContract();
  const organizerKey = organizerIdToBytes32(organizerId);
  const [seed, fulfilled] = (await vrf.getOrganizerCodeSeed(organizerKey)) as [bigint, boolean];
  return { seed, fulfilled };
}

export async function requestOrganizerCodeVrfSeed(organizerId: string): Promise<{ requestTx: string }> {
  const vrf = getRelayerOrganizerCodeVrfContract();
  const organizerKey = organizerIdToBytes32(organizerId);
  const tx = await vrf.requestOrganizerCodeRandomness(organizerKey, {
    gasLimit: ORGANIZER_CODE_VRF_GAS_LIMIT,
  });
  const receipt = await tx.wait();
  if (!receipt) throw new Error("Organizer code VRF request failed.");
  return { requestTx: receipt.hash };
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

export async function mintMeetupPassportForMember(
  walletAddress: string,
  communityId: string,
  meetupSlug: string,
  metadataURI: string,
): Promise<{ mintTx: string; tokenId: number }> {
  if (!isMeetupPassportConfigured()) {
    throw new Error("Meetup passport contract is not configured.");
  }
  const meetupPassport = getRelayerMeetupPassportContract();
  const meetupId = meetupIdToBytes32(meetupSlug);
  const tx = await meetupPassport.mintMeetupPassport(walletAddress, communityId, meetupId, metadataURI, {
    gasLimit: MINT_GAS_LIMIT,
  });
  const receipt = await tx.wait();
  if (!receipt) throw new Error("Meetup passport mint transaction failed.");

  const tokenId = Number(await meetupPassport.tokenIdOf(meetupId, communityId));
  return { mintTx: receipt.hash, tokenId };
}

export async function readMeetupPassportStatus(
  communityId: string,
  meetupSlug: string,
): Promise<{ minted: boolean; tokenId: number }> {
  if (!isMeetupPassportConfigured()) {
    return { minted: false, tokenId: 0 };
  }
  const meetupPassport = getReadOnlyMeetupPassportContract();
  const meetupId = meetupIdToBytes32(meetupSlug);
  const tokenId = Number(await meetupPassport.tokenIdOf(meetupId, communityId));
  return { minted: tokenId > 0, tokenId };
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
