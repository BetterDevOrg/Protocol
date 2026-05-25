export type Member = {
  communityId: string;
  memberDisplay: string;
  joinDate: string;
  reputation: number;
  inviteLink: string;
};

export type RegistrationPayload = {
  fullName: string;
  email: string;
  city: string;
  xUsername: string;
  xProfileLink?: string;
  screenshotFileName?: string | null;
};
