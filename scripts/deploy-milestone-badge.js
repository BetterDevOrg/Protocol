const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const owner = deployer.address;

  console.log(`Deploying MilestoneBadge with owner: ${owner}`);

  const MilestoneBadge = await ethers.getContractFactory("MilestoneBadge");
  const milestoneBadge = await MilestoneBadge.deploy(owner);
  await milestoneBadge.waitForDeployment();

  console.log(
    JSON.stringify(
      {
        MilestoneBadge: await milestoneBadge.getAddress(),
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
