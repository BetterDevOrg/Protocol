export const betterDevContractAddresses = {
  passport: process.env.NEXT_PUBLIC_BETTERDEV_PASSPORT_ADDRESS || "",
  reputationRegistry: process.env.NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS || "",
  meetupRegistry: process.env.NEXT_PUBLIC_MEETUP_REGISTRY_ADDRESS || "",
  builderCircleVrf: process.env.NEXT_PUBLIC_BUILDER_CIRCLE_VRF_ADDRESS || "",
  organizerReputationRegistry: process.env.NEXT_PUBLIC_ORGANIZER_REPUTATION_REGISTRY_ADDRESS || "",
  organizerCodeVrf: process.env.NEXT_PUBLIC_ORGANIZER_CODE_VRF_ADDRESS || "",
} as const;

export function areBetterDevContractsConfigured(): boolean {
  return (
    Boolean(betterDevContractAddresses.passport) &&
    Boolean(betterDevContractAddresses.reputationRegistry) &&
    Boolean(betterDevContractAddresses.meetupRegistry) &&
    Boolean(betterDevContractAddresses.builderCircleVrf)
  );
}

export function isOrganizerReputationOnChainConfigured(): boolean {
  return Boolean(betterDevContractAddresses.organizerReputationRegistry);
}

export function isOrganizerCodeVrfConfigured(): boolean {
  return Boolean(betterDevContractAddresses.organizerCodeVrf);
}
