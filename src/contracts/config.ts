export const betterDevContractAddresses = {
  passport: process.env.NEXT_PUBLIC_BETTERDEV_PASSPORT_ADDRESS || "",
  reputationRegistry: process.env.NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS || "",
  meetupRegistry: process.env.NEXT_PUBLIC_MEETUP_REGISTRY_ADDRESS || "",
  builderCircleVrf: process.env.NEXT_PUBLIC_BUILDER_CIRCLE_VRF_ADDRESS || "",
} as const;

export function areBetterDevContractsConfigured(): boolean {
  return Object.values(betterDevContractAddresses).every(Boolean);
}
