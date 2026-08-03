export type EarlyContributor = {
  name: string;
  github: string;
};

export const EARLY_CONTRIBUTORS: EarlyContributor[] = [
  { name: "Lucas Vasconcelos", github: "lucasvass1" },
  { name: "Loi Nguyen", github: "lntutor" },
  { name: "Mohd Sadaf", github: "MsadafK" },
  { name: "Hardeep Dilip", github: "Dashetty" },
  { name: "Shivang Kumar", github: "Shivang9983" },
  { name: "Ayush Sharma", github: "AyushS1304" },
  { name: "blaqjeff", github: "blaqjeff" },
  { name: "DAmensah27", github: "DAmensah27" },
  { name: "sm21707", github: "sm21707" },
  { name: "ritikamalpani123", github: "ritikamalpani123" },
];

export function githubAvatarUrl(username: string, size = 128): string {
  return `https://avatars.githubusercontent.com/${username}?s=${size}`;
}
