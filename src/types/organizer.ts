export type OrganizerStatus = "pending" | "active" | "suspended";

export type Organizer = {
  createdAt: string;
  communityId: string;
  fullName: string;
  organizerId: string;
  organizerCode: string;
  city: string;
  country: string;
  status: OrganizerStatus;
  organizerReputation: number;
  eventsHosted: number;
  xUsername: string;
  bio: string;
  approvedAt: string;
  email?: string;
  onChainReputation?: number | null;
  codeVrfFulfilled?: boolean;
  codeVrfSeed?: string;
};

export type OrganizerApplyPayload = {
  city: string;
  country: string;
  bio?: string;
};
