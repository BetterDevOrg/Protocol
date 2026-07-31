const { ethers } = require("hardhat");

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const owner = deployer.address;

  console.log(`Deploying OrganizerCodeVRF with owner: ${owner}`);

  const OrganizerCodeVRF = await ethers.getContractFactory("OrganizerCodeVRF");
  const organizerCodeVrf = await OrganizerCodeVRF.deploy(
    requiredEnv("VRF_COORDINATOR_ADDRESS"),
    BigInt(requiredEnv("VRF_SUBSCRIPTION_ID")),
    requiredEnv("VRF_KEY_HASH"),
    Number(process.env.VRF_CALLBACK_GAS_LIMIT || 200000),
    Number(process.env.VRF_REQUEST_CONFIRMATIONS || 3),
  );
  await organizerCodeVrf.waitForDeployment();

  console.log(
    JSON.stringify(
      {
        OrganizerCodeVRF: await organizerCodeVrf.getAddress(),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
