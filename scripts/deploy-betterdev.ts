import { ethers } from "hardhat";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const owner = deployer.address;

  console.log(`Deploying BetterDev protocol with owner: ${owner}`);

  const Passport = await ethers.getContractFactory("BetterDevPassport");
  const passport = await Passport.deploy(owner);
  await passport.waitForDeployment();

  const Reputation = await ethers.getContractFactory("ReputationRegistry");
  const reputation = await Reputation.deploy(owner);
  await reputation.waitForDeployment();

  const Meetup = await ethers.getContractFactory("MeetupRegistry");
  const meetup = await Meetup.deploy(owner, await reputation.getAddress());
  await meetup.waitForDeployment();

  await (await reputation.setVerifier(await meetup.getAddress(), true)).wait();

  const BuilderCircleVRF = await ethers.getContractFactory("BuilderCircleVRF");
  const builderCircleVrf = await BuilderCircleVRF.deploy(
    requiredEnv("VRF_COORDINATOR_ADDRESS"),
    BigInt(requiredEnv("VRF_SUBSCRIPTION_ID")),
    requiredEnv("VRF_KEY_HASH"),
    Number(process.env.VRF_CALLBACK_GAS_LIMIT || 200000),
    Number(process.env.VRF_REQUEST_CONFIRMATIONS || 3),
  );
  await builderCircleVrf.waitForDeployment();

  const OrganizerReputation = await ethers.getContractFactory("OrganizerReputationRegistry");
  const organizerReputation = await OrganizerReputation.deploy(owner);
  await organizerReputation.waitForDeployment();

  const relayerAddress = process.env.ORGANIZER_PRIVATE_KEY
    ? new ethers.Wallet(process.env.ORGANIZER_PRIVATE_KEY).address
    : owner;
  await (await organizerReputation.setVerifier(relayerAddress, true)).wait();

  const OrganizerCodeVRF = await ethers.getContractFactory("OrganizerCodeVRF");
  const organizerCodeVrf = await OrganizerCodeVRF.deploy(
    requiredEnv("VRF_COORDINATOR_ADDRESS"),
    BigInt(requiredEnv("VRF_SUBSCRIPTION_ID")),
    requiredEnv("VRF_KEY_HASH"),
    Number(process.env.VRF_CALLBACK_GAS_LIMIT || 200000),
    Number(process.env.VRF_REQUEST_CONFIRMATIONS || 3),
  );
  await organizerCodeVrf.waitForDeployment();

  const addresses = {
    BetterDevPassport: await passport.getAddress(),
    ReputationRegistry: await reputation.getAddress(),
    MeetupRegistry: await meetup.getAddress(),
    BuilderCircleVRF: await builderCircleVrf.getAddress(),
    OrganizerReputationRegistry: await organizerReputation.getAddress(),
    OrganizerCodeVRF: await organizerCodeVrf.getAddress(),
  };

  console.log("BetterDev protocol deployed:");
  console.log(JSON.stringify(addresses, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
