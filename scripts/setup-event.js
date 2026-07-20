const { ethers } = require("hardhat");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function main() {
  const meetupSlug =
    process.env.EVENT_MEETUP_ID?.trim() ||
    process.env.NEXT_PUBLIC_EVENT_MEETUP_ID?.trim() ||
    "betterdev-lagos-001";

  const rpcUrl = requiredEnv("ARBITRUM_SEPOLIA_RPC_URL");
  const privateKey =
    process.env.ORGANIZER_PRIVATE_KEY?.trim() || process.env.DEPLOYER_PRIVATE_KEY?.trim();
  if (!privateKey) throw new Error("Missing ORGANIZER_PRIVATE_KEY or DEPLOYER_PRIVATE_KEY");
  const meetupRegistryAddress = requiredEnv("NEXT_PUBLIC_MEETUP_REGISTRY_ADDRESS");

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  const MeetupRegistry = await ethers.getContractFactory("MeetupRegistry");
  const meetup = MeetupRegistry.attach(meetupRegistryAddress).connect(wallet);

  const meetupId = ethers.id(meetupSlug);
  const metadataBase =
    process.env.PASSPORT_METADATA_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "https://betterdev.vercel.app";
  const metadataURI = `${metadataBase.replace(/\/$/, "")}/api/meetups/${meetupSlug}/metadata`;

  try {
    const existing = await meetup.meetup(meetupId);
    if (existing.createdAt && existing.createdAt > 0n) {
      console.log(`Meetup already exists: ${meetupSlug}`);
      console.log(JSON.stringify({ meetupSlug, meetupId, active: existing.active }, null, 2));
      return;
    }
  } catch {
    // not found — create below
  }

  const tx = await meetup.createMeetup(meetupId, metadataURI, { gasLimit: 350_000 });
  const receipt = await tx.wait();
  console.log(`Created meetup ${meetupSlug}`);
  console.log(JSON.stringify({ meetupSlug, meetupId, txHash: receipt.hash }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
