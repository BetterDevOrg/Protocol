const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const owner = deployer.address;

  console.log(`Deploying OrganizerReputationRegistry with owner: ${owner}`);

  const OrganizerReputation = await ethers.getContractFactory("OrganizerReputationRegistry");
  const organizerReputation = await OrganizerReputation.deploy(owner);
  await organizerReputation.waitForDeployment();

  const relayerPrivateKey =
    process.env.ORGANIZER_PRIVATE_KEY?.trim() || process.env.DEPLOYER_PRIVATE_KEY?.trim();
  const relayerAddress = relayerPrivateKey
    ? new ethers.Wallet(relayerPrivateKey).address
    : owner;

  await (await organizerReputation.setVerifier(relayerAddress, true)).wait();

  console.log(
    JSON.stringify(
      {
        OrganizerReputationRegistry: await organizerReputation.getAddress(),
        relayerVerifier: relayerAddress,
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
