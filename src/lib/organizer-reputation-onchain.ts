import { OrganizerReputationRegistryAbi } from "@/contracts/abis";
import {
  betterDevContractAddresses,
  isOrganizerReputationOnChainConfigured,
} from "@/contracts/config";
import { meetupIdToBytes32 } from "@/lib/contracts";
import { recordOrganizerEventCreatedInGoogleSheets } from "@/lib/google-sheets/client";
import {
  ORGANIZER_REP_EVENT_TYPES,
  ORGANIZER_REP_POINTS,
  type OrganizerRepEventType,
  type OrganizerReputationRecordResult,
} from "@/lib/organizer-reputation";
import { getReadOnlyProvider, getRelayerSigner } from "@/lib/relayer";
import { Contract } from "ethers";

const RECORD_GAS_LIMIT = 350_000;

function getOrganizerReputationRegistryAddress(): string {
  const address = betterDevContractAddresses.organizerReputationRegistry;
  if (!address) {
    throw new Error("OrganizerReputationRegistry address is not configured.");
  }
  return address;
}

export function getReadOnlyOrganizerReputationContract() {
  return new Contract(
    getOrganizerReputationRegistryAddress(),
    OrganizerReputationRegistryAbi,
    getReadOnlyProvider(),
  );
}

export function getRelayerOrganizerReputationContract() {
  const signer = getRelayerSigner();
  return new Contract(
    getOrganizerReputationRegistryAddress(),
    OrganizerReputationRegistryAbi,
    signer,
  );
}

export async function readOrganizerReputationOnChain(organizerId: string): Promise<number> {
  if (!isOrganizerReputationOnChainConfigured()) {
    return 0;
  }

  const registry = getReadOnlyOrganizerReputationContract();
  const reputation = (await registry.reputationOf(organizerId.trim().toUpperCase())) as bigint;
  return Number(reputation);
}

export async function isOrganizerReputationRecordedOnChain(input: {
  organizerId: string;
  eventType: OrganizerRepEventType;
  meetupSlug: string;
}): Promise<boolean> {
  if (!isOrganizerReputationOnChainConfigured()) {
    return false;
  }

  const registry = getReadOnlyOrganizerReputationContract();
  const dedupeKey = meetupIdToBytes32(input.meetupSlug);
  return Boolean(
    await registry.isRecorded(
      input.organizerId.trim().toUpperCase(),
      input.eventType,
      dedupeKey,
    ),
  );
}

export async function recordOrganizerReputationAction(input: {
  organizerId: string;
  eventType: OrganizerRepEventType;
  meetupSlug: string;
  proofURI: string;
  incrementEventsHosted?: boolean;
}): Promise<OrganizerReputationRecordResult> {
  const organizerId = input.organizerId.trim().toUpperCase();
  const points =
    input.eventType === ORGANIZER_REP_EVENT_TYPES.MEETUP_HOSTED
      ? ORGANIZER_REP_POINTS.MEETUP_HOSTED
      : ORGANIZER_REP_POINTS.BUILDER_CIRCLES;

  const result: OrganizerReputationRecordResult = {
    recordedOnChain: false,
    sheetUpdated: false,
  };

  if (isOrganizerReputationOnChainConfigured()) {
    try {
      const dedupeKey = meetupIdToBytes32(input.meetupSlug);
      const alreadyRecorded = await isOrganizerReputationRecordedOnChain({
        organizerId,
        eventType: input.eventType,
        meetupSlug: input.meetupSlug,
      });

      if (alreadyRecorded) {
        result.alreadyRecordedOnChain = true;
        result.onChainReputation = await readOrganizerReputationOnChain(organizerId);
        return result;
      } else {
        const registry = getRelayerOrganizerReputationContract();
        const tx = await registry.recordEvent(
          organizerId,
          input.eventType,
          points,
          dedupeKey,
          input.proofURI,
          { gasLimit: RECORD_GAS_LIMIT },
        );
        const receipt = await tx.wait();
        result.recordedOnChain = Boolean(receipt);
        result.onChainTx = receipt?.hash;
        result.onChainReputation = await readOrganizerReputationOnChain(organizerId);
      }
    } catch (e) {
      console.error("[organizer-reputation/on-chain]", e);
    }
  }

  const sheetResult = await recordOrganizerEventCreatedInGoogleSheets({
    organizerId,
    reputationDelta: points,
    incrementEventsHosted: input.incrementEventsHosted !== false,
  });

  result.sheetUpdated = sheetResult.ok;

  return result;
}
