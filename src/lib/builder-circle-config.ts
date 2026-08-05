export const MIN_BUILDER_CIRCLE_PARTICIPANTS = 6;
export const DEFAULT_BUILDER_CIRCLE_GROUP_SIZE = 4;
export const BUILDER_CIRCLE_GROUP_SIZE_MIN = 4;
export const BUILDER_CIRCLE_GROUP_SIZE_MAX = 6;
export const BUILDER_CIRCLE_EXAMPLE_ATTENDEES = 24;
export const ORGANIZER_REP_BUILDER_CIRCLE_BONUS = 5;

export type BuilderCirclePoolMode = "rsvp" | "city" | "hybrid";

export type MeetupCheckinAttendee = {
  createdAt: string;
  meetupId: string;
  communityId: string;
  email: string;
  fullName: string;
  city: string;
  country: string;
  xUsername: string;
};

export type StoredBuilderCircleMember = {
  communityId: string;
  fullName: string;
  city: string;
  role: string;
};

export type StoredBuilderCircle = {
  id: string;
  members: StoredBuilderCircleMember[];
};

export type BuilderCircleAssignment = {
  createdAt: string;
  meetupId: string;
  organizerId: string;
  city: string;
  attendeeCount: number;
  groupSize: number;
  vrfSeed: string;
  vrfFulfilled: boolean;
  circles: StoredBuilderCircle[];
  status: string;
};
