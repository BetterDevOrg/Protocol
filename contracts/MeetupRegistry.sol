// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReputationRegistry} from "./ReputationRegistry.sol";

/// @title BetterDev Meetup Registry
/// @notice Creates meetups and records verified attendance against canonical member IDs.
contract MeetupRegistry is Ownable {
    uint256 public constant ATTEND_MEETUP_EVENT_TYPE = 1;
    uint256 public constant ATTEND_MEETUP_POINTS = 20;

    struct Meetup {
        bytes32 meetupId;
        string metadataURI;
        bool active;
        uint256 createdAt;
    }

    ReputationRegistry public reputationRegistry;

    mapping(bytes32 => Meetup) private _meetups;
    mapping(bytes32 => mapping(string => bool)) private _attended;

    event ReputationRegistryUpdated(address indexed registry);
    event MeetupCreated(bytes32 indexed meetupId, string metadataURI);
    event MeetupStatusUpdated(bytes32 indexed meetupId, bool active);
    event AttendanceVerified(bytes32 indexed meetupId, string indexed memberId, address indexed verifier, string proofURI);

    constructor(address initialOwner, address reputationRegistryAddress) Ownable(initialOwner) {
        _setReputationRegistry(reputationRegistryAddress);
    }

    function setReputationRegistry(address reputationRegistryAddress) external onlyOwner {
        _setReputationRegistry(reputationRegistryAddress);
    }

    function createMeetup(bytes32 meetupId, string calldata metadataURI) external onlyOwner {
        require(meetupId != bytes32(0), "Invalid meetup");
        require(_meetups[meetupId].createdAt == 0, "Meetup exists");

        _meetups[meetupId] = Meetup({meetupId: meetupId, metadataURI: metadataURI, active: true, createdAt: block.timestamp});

        emit MeetupCreated(meetupId, metadataURI);
    }

    function setMeetupActive(bytes32 meetupId, bool active) external onlyOwner {
        require(_meetups[meetupId].createdAt != 0, "Unknown meetup");
        _meetups[meetupId].active = active;
        emit MeetupStatusUpdated(meetupId, active);
    }

    function verifyAttendance(bytes32 meetupId, string calldata memberId, string calldata proofURI) external onlyOwner {
        require(_meetups[meetupId].active, "Meetup inactive");
        require(bytes(memberId).length > 0, "Invalid member ID");
        require(!_attended[meetupId][memberId], "Already attended");

        _attended[meetupId][memberId] = true;
        reputationRegistry.recordEvent(memberId, ATTEND_MEETUP_EVENT_TYPE, ATTEND_MEETUP_POINTS, proofURI);

        emit AttendanceVerified(meetupId, memberId, msg.sender, proofURI);
    }

    function meetup(bytes32 meetupId) external view returns (Meetup memory) {
        require(_meetups[meetupId].createdAt != 0, "Unknown meetup");
        return _meetups[meetupId];
    }

    function hasAttended(bytes32 meetupId, string calldata memberId) external view returns (bool) {
        return _attended[meetupId][memberId];
    }

    function _setReputationRegistry(address reputationRegistryAddress) private {
        require(reputationRegistryAddress != address(0), "Invalid registry");
        reputationRegistry = ReputationRegistry(reputationRegistryAddress);
        emit ReputationRegistryUpdated(reputationRegistryAddress);
    }
}
