export const ORGANIZER_REP_EVENT_TYPES = {
  MEETUP_HOSTED: 1,
  BUILDER_CIRCLES: 2,
} as const;

export type OrganizerRepEventType =
  (typeof ORGANIZER_REP_EVENT_TYPES)[keyof typeof ORGANIZER_REP_EVENT_TYPES];

export const ORGANIZER_REP_POINTS = {
  MEETUP_HOSTED: 10,
  BUILDER_CIRCLES: 5,
} as const;

export type OrganizerReputationRecordResult = {
  recordedOnChain: boolean;
  onChainTx?: string;
  onChainReputation?: number;
  sheetUpdated: boolean;
  alreadyRecordedOnChain?: boolean;
};

export function displayOrganizerReputation(input: {
  onChainReputation?: number | null;
  sheetReputation: number;
  onChainConfigured: boolean;
}): number {
  if (!input.onChainConfigured) {
    return input.sheetReputation;
  }
  const onChain = input.onChainReputation ?? 0;
  return Math.max(onChain, input.sheetReputation);
}
