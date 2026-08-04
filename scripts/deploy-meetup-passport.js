const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const owner = deployer.address;

  console.log(`Deploying MeetupPassport with owner: ${owner}`);

  const MeetupPassport = await ethers.getContractFactory("MeetupPassport");
  const meetupPassport = await MeetupPassport.deploy(owner);
  await meetupPassport.waitForDeployment();

  console.log(
    JSON.stringify(
      {
        MeetupPassport: await meetupPassport.getAddress(),
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
