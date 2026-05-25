export type OnboardingModalStep = "gate" | "form" | "optional" | "success";

export type OnboardingFormState = {
  fullName: string;
  email: string;
  city: string;
  xUsername: string;
  commitment: boolean;
  xProfileLink: string;
  screenshotFileName: string | null;
};
