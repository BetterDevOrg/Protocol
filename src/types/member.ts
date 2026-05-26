export type Member = {
  id?: string;
  communityId: string;
  memberDisplay: string;
  joinDate: string;
  reputation: number;
  inviteLink: string;
  fullName?: string;
  email?: string;
  city?: string;
  country?: string | null;
  phoneE164?: string;
  xHandle?: string;
};

export type RegistrationPayload = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  xUsername: string;
  xProfileLink?: string;
  screenshotFileName?: string | null;
  followedX?: boolean;
  joinedCommunity?: boolean;
};
