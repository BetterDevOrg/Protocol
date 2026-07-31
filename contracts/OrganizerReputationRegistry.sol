// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title BetterDev Organizer Reputation Registry
/// @notice Append-only organizer reputation keyed by canonical organizer IDs (e.g. ORG-0001).
/// @dev Separate from member ReputationRegistry. Uses dedupe keys to prevent double-awards.
contract OrganizerReputationRegistry is Ownable {
    uint256 public constant MEETUP_HOSTED_EVENT_TYPE = 1;
    uint256 public constant BUILDER_CIRCLES_EVENT_TYPE = 2;

    struct OrganizerReputationEvent {
        string organizerId;
        uint256 eventType;
        uint256 points;
        bytes32 dedupeKey;
        address issuer;
        string proofURI;
        uint256 timestamp;
    }

    OrganizerReputationEvent[] private _events;
    mapping(address => bool) public verifiers;
    mapping(string => uint256) private _reputationOf;
    mapping(bytes32 => bool) private _dedupe;

    event VerifierSet(address indexed verifier, bool allowed);
    event OrganizerReputationEventRecorded(
        uint256 indexed eventId,
        string indexed organizerId,
        uint256 indexed eventType,
        uint256 points,
        bytes32 dedupeKey,
        address issuer,
        string proofURI
    );

    modifier onlyVerifier() {
        require(verifiers[msg.sender] || msg.sender == owner(), "Not verifier");
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {
        verifiers[initialOwner] = true;
        emit VerifierSet(initialOwner, true);
    }

    function setVerifier(address verifier, bool allowed) external onlyOwner {
        require(verifier != address(0), "Invalid verifier");
        verifiers[verifier] = allowed;
        emit VerifierSet(verifier, allowed);
    }

    function recordEvent(
        string calldata organizerId,
        uint256 eventType,
        uint256 points,
        bytes32 dedupeKey,
        string calldata proofURI
    ) external onlyVerifier returns (uint256 eventId) {
        require(bytes(organizerId).length > 0, "Invalid organizer ID");
        require(points > 0, "Invalid points");

        bytes32 dedupeId = keccak256(abi.encode(organizerId, eventType, dedupeKey));
        require(!_dedupe[dedupeId], "Already recorded");
        _dedupe[dedupeId] = true;

        eventId = _events.length;
        _events.push(
            OrganizerReputationEvent({
                organizerId: organizerId,
                eventType: eventType,
                points: points,
                dedupeKey: dedupeKey,
                issuer: msg.sender,
                proofURI: proofURI,
                timestamp: block.timestamp
            })
        );

        _reputationOf[organizerId] += points;

        emit OrganizerReputationEventRecorded(
            eventId, organizerId, eventType, points, dedupeKey, msg.sender, proofURI
        );
    }

    function reputationOf(string calldata organizerId) external view returns (uint256) {
        return _reputationOf[organizerId];
    }

    function isRecorded(string calldata organizerId, uint256 eventType, bytes32 dedupeKey)
        external
        view
        returns (bool)
    {
        bytes32 dedupeId = keccak256(abi.encode(organizerId, eventType, dedupeKey));
        return _dedupe[dedupeId];
    }

    function eventCount() external view returns (uint256) {
        return _events.length;
    }

    function reputationEvent(uint256 eventId) external view returns (OrganizerReputationEvent memory) {
        require(eventId < _events.length, "Unknown event");
        return _events[eventId];
    }
}
