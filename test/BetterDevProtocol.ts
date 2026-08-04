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

  it("mints a meetup passport stamp once per member and meetup", async function () {
    const { owner, member, meetup } = await deployProtocol();
    const meetupId = ethers.id("betterdev-lagos-001");

    const MeetupPassport = await ethers.getContractFactory("MeetupPassport");
    const meetupPassport = await MeetupPassport.deploy(owner.address);

    await meetup.createMeetup(meetupId, "ipfs://meetup-1");
    await meetup.verifyAttendance(meetupId, "BD-000001", "ipfs://attendance-1");

    await expect(
      meetupPassport.mintMeetupPassport(member.address, "BD-000001", meetupId, "ipfs://meetup-passport-1"),
    )
      .to.emit(meetupPassport, "MeetupPassportMinted")
      .withArgs(member.address, "BD-000001", meetupId, 1, "ipfs://meetup-passport-1");

    expect(await meetupPassport.tokenIdOf(meetupId, "BD-000001")).to.equal(1);
    expect(await meetupPassport.tokenURI(1)).to.equal("ipfs://meetup-passport-1");

    await expect(
      meetupPassport.mintMeetupPassport(member.address, "BD-000001", meetupId, "ipfs://meetup-passport-2"),
    ).to.be.revertedWith("Already minted");
  });

  it("records organizer reputation with dedupe by meetup", async function () {
    const [owner] = await ethers.getSigners();
    const OrganizerReputation = await ethers.getContractFactory("OrganizerReputationRegistry");
    const organizerReputation = await OrganizerReputation.deploy(owner.address);
    const meetupKey = ethers.id("betterdev-lagos-001");

    await expect(
      organizerReputation.recordEvent("ORG-0001", 1, 10, meetupKey, "ipfs://hosted-1"),
    )
      .to.emit(organizerReputation, "OrganizerReputationEventRecorded")
      .withArgs(0, "ORG-0001", 1, 10, meetupKey, owner.address, "ipfs://hosted-1");

    expect(await organizerReputation.reputationOf("ORG-0001")).to.equal(10);
    expect(await organizerReputation.isRecorded("ORG-0001", 1, meetupKey)).to.equal(true);

    await expect(
      organizerReputation.recordEvent("ORG-0001", 1, 10, meetupKey, "ipfs://hosted-1"),
    ).to.be.revertedWith("Already recorded");
  });

  it("issues organizer code randomness once per organizer key", async function () {
    const [owner] = await ethers.getSigners();
    const MockCoordinator = await ethers.getContractFactory("MockVRFCoordinatorV2Plus");
    const coordinator = await MockCoordinator.deploy();
    const OrganizerCodeVRF = await ethers.getContractFactory("OrganizerCodeVRF");
    const organizerCodeVrf = await OrganizerCodeVRF.deploy(
      await coordinator.getAddress(),
      1n,
      ethers.ZeroHash,
      200000,
      3,
    );
    const organizerKey = ethers.id("ORG-0001");

    await expect(organizerCodeVrf.requestOrganizerCodeRandomness(organizerKey))
      .to.emit(organizerCodeVrf, "OrganizerCodeRandomnessRequested");

    await expect(organizerCodeVrf.requestOrganizerCodeRandomness(organizerKey)).to.be.revertedWith(
      "Already requested",
    );

    const [seedBefore, fulfilledBefore] = await organizerCodeVrf.getOrganizerCodeSeed(organizerKey);
    expect(fulfilledBefore).to.equal(false);
    expect(seedBefore).to.equal(0n);

    const [, requestId] = await organizerCodeVrf.organizerRandomness(organizerKey);
    await coordinator.fulfillRandomWords(requestId, [42n]);

    const [seedAfter, fulfilledAfter] = await organizerCodeVrf.getOrganizerCodeSeed(organizerKey);
    expect(fulfilledAfter).to.equal(true);
    expect(seedAfter).to.equal(42n);

    await expect(organizerCodeVrf.requestOrganizerCodeRandomness(organizerKey)).to.be.revertedWith(
      "Already fulfilled",
    );
  });
});
