import fs from "node:fs";
import path from "node:path";

const contracts = ["BetterDevPassport", "ReputationRegistry", "MeetupRegistry", "BuilderCircleVRF"] as const;

const root = process.cwd();
const outputDir = path.join(root, "src", "contracts");

fs.mkdirSync(outputDir, { recursive: true });

const abiExports = contracts
  .map((contractName) => {
    const artifactPath = path.join(root, "artifacts", "contracts", `${contractName}.sol`, `${contractName}.json`);
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8")) as { abi: unknown };
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
} as const;

export function areBetterDevContractsConfigured(): boolean {
  return Object.values(betterDevContractAddresses).every(Boolean);
}
`;

fs.writeFileSync(path.join(outputDir, "abis.ts"), `${abiExports}\n`);
fs.writeFileSync(path.join(outputDir, "config.ts"), config);

console.log(`Exported BetterDev ABIs to ${outputDir}`);
