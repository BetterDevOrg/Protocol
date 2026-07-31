import { isOrganizerCodeVrfConfigured } from "@/contracts/config";
import { contractExplorerUrl, transactionExplorerUrl } from "@/lib/contracts";
import { betterDevContractAddresses } from "@/contracts/config";
import {
  deriveOrganizerCodeFromSeed,
  isPendingOrganizerCode,
  organizerIdToBytes32,
} from "@/lib/organizer-code";
import { updateOrganizerCodeInGoogleSheets } from "@/lib/google-sheets/client";
import { readOrganizerCodeVrfSeed, requestOrganizerCodeVrfSeed } from "@/lib/relayer";

export type OrganizerCodeStatus = {
  organizerId: string;
  organizerCode: string;
  vrfFulfilled: boolean;
  vrfSeed: string;
  pending: boolean;
  onChainConfigured: boolean;
  requestTx?: string;
  vrfContractAddress?: string;
};

export async function readOrganizerCodeStatus(input: {
  organizerId: string;
  sheetCode: string;
  sheetVrfFulfilled?: boolean;
  sheetVrfSeed?: string;
}): Promise<OrganizerCodeStatus> {
  const organizerId = input.organizerId.trim().toUpperCase();
  const onChainConfigured = isOrganizerCodeVrfConfigured();

  if (!onChainConfigured) {
    return {
      organizerId,
      organizerCode: input.sheetCode,
      vrfFulfilled: Boolean(input.sheetVrfFulfilled),
      vrfSeed: input.sheetVrfSeed ?? "",
      pending: isPendingOrganizerCode(input.sheetCode),
      onChainConfigured: false,
    };
  }

  const vrf = await readOrganizerCodeVrfSeed(organizerId);
  if (vrf.fulfilled) {
    const organizerCode = deriveOrganizerCodeFromSeed(vrf.seed);
    return {
      organizerId,
      organizerCode,
      vrfFulfilled: true,
      vrfSeed: vrf.seed.toString(),
      pending: false,
      onChainConfigured: true,
      vrfContractAddress: betterDevContractAddresses.organizerCodeVrf,
    };
  }

  return {
    organizerId,
    organizerCode: input.sheetCode,
    vrfFulfilled: Boolean(input.sheetVrfFulfilled),
    vrfSeed: input.sheetVrfSeed ?? "",
    pending: isPendingOrganizerCode(input.sheetCode) || !input.sheetVrfFulfilled,
    onChainConfigured: true,
    vrfContractAddress: betterDevContractAddresses.organizerCodeVrf,
  };
}

export async function issueOrganizerVrfCode(input: {
  organizerId: string;
  origin: string;
}): Promise<OrganizerCodeStatus & { syncedToSheet: boolean }> {
  if (!isOrganizerCodeVrfConfigured()) {
    throw new Error("OrganizerCodeVRF is not configured.");
  }

  const organizerId = input.organizerId.trim().toUpperCase();
  let requestTx: string | undefined;

  const existing = await readOrganizerCodeVrfSeed(organizerId);
  if (!existing.fulfilled) {
    try {
      const requested = await requestOrganizerCodeVrfSeed(organizerId);
      requestTx = requested.requestTx;
    } catch (e) {
      const message = e instanceof Error ? e.message.toLowerCase() : "";
      if (!message.includes("already requested") && !message.includes("already fulfilled")) {
        throw e;
      }
    }
  }

  const vrf = await readOrganizerCodeVrfSeed(organizerId);
  if (!vrf.fulfilled) {
    return {
      organizerId,
      organizerCode: "PENDING-VRF",
      vrfFulfilled: false,
      vrfSeed: "",
      pending: true,
      onChainConfigured: true,
      requestTx,
      syncedToSheet: false,
      vrfContractAddress: betterDevContractAddresses.organizerCodeVrf,
    };
  }

  const organizerCode = deriveOrganizerCodeFromSeed(vrf.seed);
  const syncResult = await updateOrganizerCodeInGoogleSheets({
    organizerId,
    organizerCode,
    vrfSeed: vrf.seed.toString(),
    vrfFulfilled: true,
  });

  return {
    organizerId,
    organizerCode,
    vrfFulfilled: true,
    vrfSeed: vrf.seed.toString(),
    pending: false,
    onChainConfigured: true,
    requestTx,
    syncedToSheet: syncResult.ok,
    vrfContractAddress: betterDevContractAddresses.organizerCodeVrf,
  };
}

export function organizerCodeExplorerLinks(status: OrganizerCodeStatus) {
  return {
    contractUrl: status.vrfContractAddress ? contractExplorerUrl(status.vrfContractAddress) : null,
    requestTxUrl: status.requestTx ? transactionExplorerUrl(status.requestTx) : null,
    organizerKey: organizerIdToBytes32(status.organizerId),
  };
}
