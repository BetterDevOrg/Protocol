import fs from "node:fs";
import path from "node:path";

const contracts = [
  "BetterDevPassport",
  "ReputationRegistry",
  "MeetupRegistry",
  "BuilderCircleVRF",
  "OrganizerReputationRegistry",
  "OrganizerCodeVRF",
];

const root = process.cwd();
const outputDir = path.join(root, "src", "contracts");

fs.mkdirSync(outputDir, { recursive: true });

const abiExports = contracts
  .map((contractName) => {
    const artifactPath = path.join(
      root,
      "artifacts",
      "contracts",
      `${contractName}.sol`,
      `${contractName}.json`,
    );
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abiPath = path.join(outputDir, `${contractName}.json`);

    fs.writeFileSync(abiPath, `${JSON.stringify(artifact.abi, null, 2)}\n`);

    return `export { default as ${contractName}Abi } from "./${contractName}.json";`;
  })
  .join("\n");

const config = `export const betterDevContractAddresses = {
  passport: process.env.NEXT_PUBLIC_BETTERDEV_PASSPORT_ADDRESS || "",
  reputationRegistry: process.env.NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS || "",
  meetupRegistry: process.env.NEXT_PUBLIC_MEETUP_REGISTRY_ADDRESS || "",
  builderCircleVrf: process.env.NEXT_PUBLIC_BUILDER_CIRCLE_VRF_ADDRESS || "",
  organizerReputationRegistry: process.env.NEXT_PUBLIC_ORGANIZER_REPUTATION_REGISTRY_ADDRESS || "",
  organizerCodeVrf: process.env.NEXT_PUBLIC_ORGANIZER_CODE_VRF_ADDRESS || "",
} as const;

export function areBetterDevContractsConfigured(): boolean {
  return (
    Boolean(betterDevContractAddresses.passport) &&
    Boolean(betterDevContractAddresses.reputationRegistry) &&
    Boolean(betterDevContractAddresses.meetupRegistry) &&
    Boolean(betterDevContractAddresses.builderCircleVrf)
  );
}

export function isOrganizerReputationOnChainConfigured(): boolean {
  return Boolean(betterDevContractAddresses.organizerReputationRegistry);
}

export function isOrganizerCodeVrfConfigured(): boolean {
  return Boolean(betterDevContractAddresses.organizerCodeVrf);
}
`;

fs.writeFileSync(path.join(outputDir, "abis.ts"), `${abiExports}\n`);
fs.writeFileSync(path.join(outputDir, "config.ts"), config);

console.log(`Exported BetterDev ABIs to ${outputDir}`);
