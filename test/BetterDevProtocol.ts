import { expect } from "chai";
import hre from "hardhat";

const { ethers } = hre;

describe("BetterDev Protocol", function () {
  async function deployProtocol() {
    const [owner, member, other] = await ethers.getSigners();

    const Passport = await ethers.getContractFactory("BetterDevPassport");
    const passport = await Passport.deploy(owner.address);

    const Reputation = await ethers.getContractFactory("ReputationRegistry");
    const reputation = await Reputation.deploy(owner.address);

    const Meetup = await ethers.getContractFactory("MeetupRegistry");
    const meetup = await Meetup.deploy(owner.address, await reputation.getAddress());

    await reputation.setVerifier(await meetup.getAddress(), true);

    return { owner, member, other, passport, reputation, meetup };
  }

  it("mints a BetterDev Passport against a universal member ID", async function () {
    const { member, passport } = await deployProtocol();

    await expect(passport.mintPassport(member.address, "BD-000001", "ipfs://passport-1"))
      .to.emit(passport, "PassportMinted")
      .withArgs(member.address, "BD-000001", 1, "ipfs://passport-1");

    expect(await passport.memberIdOf(member.address)).to.equal("BD-000001");
    expect(await passport.tokenIdOfMember("BD-000001")).to.equal(1);
    expect(await passport.tokenURI(1)).to.equal("ipfs://passport-1");
  });

  it("prevents duplicate Passport minting by wallet or member ID", async function () {
    const { member, other, passport } = await deployProtocol();

    await passport.mintPassport(member.address, "BD-000001", "ipfs://passport-1");

    await expect(passport.mintPassport(member.address, "BD-000002", "ipfs://passport-2")).to.be.revertedWith(
      "Wallet already minted",
    );
    await expect(passport.mintPassport(other.address, "BD-000001", "ipfs://passport-1")).to.be.revertedWith(
      "Member already minted",
    );
  });

  it("records reputation events by member ID", async function () {
    const { reputation } = await deployProtocol();

    await expect(reputation.recordEvent("BD-000001", 2, 30, "ipfs://proof-1"))
      .to.emit(reputation, "ReputationEventRecorded")
      .withArgs(0, "BD-000001", 2, 30, await reputation.owner(), "ipfs://proof-1");

    expect(await reputation.reputationOf("BD-000001")).to.equal(30);
    expect(await reputation.eventCount()).to.equal(1);
  });

  it("verifies meetup attendance once and increments reputation", async function () {
    const { meetup, reputation } = await deployProtocol();
    const meetupId = ethers.id("betterdev-lagos-001");

    await meetup.createMeetup(meetupId, "ipfs://meetup-1");

    await expect(meetup.verifyAttendance(meetupId, "BD-000001", "ipfs://attendance-1"))
      .to.emit(meetup, "AttendanceVerified")
      .withArgs(meetupId, "BD-000001", await meetup.owner(), "ipfs://attendance-1");

    expect(await meetup.hasAttended(meetupId, "BD-000001")).to.equal(true);
    expect(await reputation.reputationOf("BD-000001")).to.equal(20);

    await expect(meetup.verifyAttendance(meetupId, "BD-000001", "ipfs://attendance-1")).to.be.revertedWith(
      "Already attended",
    );
  });

  it("supports the MVP flow from Passport to meetup reputation", async function () {
    const { member, passport, meetup, reputation } = await deployProtocol();
    const meetupId = ethers.id("betterdev-lagos-001");

    await passport.mintPassport(member.address, "BD-000001", "ipfs://passport-1");
    await meetup.createMeetup(meetupId, "ipfs://meetup-1");
    await meetup.verifyAttendance(meetupId, "BD-000001", "ipfs://attendance-1");

    expect(await passport.memberIdOf(member.address)).to.equal("BD-000001");
    expect(await meetup.hasAttended(meetupId, "BD-000001")).to.equal(true);
    expect(await reputation.reputationOf("BD-000001")).to.equal(20);
  });
});
