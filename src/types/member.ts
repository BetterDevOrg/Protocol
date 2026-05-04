export type Member = {
  communityId: string;
  joinDate: string;
  reputation: number;
};

export type RegistrationPayload = {
  fullName: string;
  email: string;
  city: string;
  xUsername: string;
};
