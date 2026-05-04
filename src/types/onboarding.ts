export type OnboardingStep = "gate" | "form" | "success";

export type OnboardingState = {
  step: OnboardingStep;
};
