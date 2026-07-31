import { isOrganizerReputationOnChainConfigured } from "@/contracts/config";
import { displayOrganizerReputation } from "@/lib/organizer-reputation";
import { readOrganizerReputationOnChain } from "@/lib/organizer-reputation-onchain";
import type { Organizer } from "@/types/organizer";

export async function enrichOrganizerWithOnChainReputation(organizer: Organizer): Promise<Organizer> {
  const onChainConfigured = isOrganizerReputationOnChainConfigured();
  const onChainReputation = onChainConfigured
    ? await readOrganizerReputationOnChain(organizer.organizerId)
    : null;

  return {
    ...organizer,
    onChainReputation,
    organizerReputation: displayOrganizerReputation({
      onChainReputation,
      sheetReputation: organizer.organizerReputation,
      onChainConfigured,
    }),
  };
}

export async function enrichOrganizersWithOnChainReputation(organizers: Organizer[]): Promise<Organizer[]> {
  return Promise.all(organizers.map(enrichOrganizerWithOnChainReputation));
}
