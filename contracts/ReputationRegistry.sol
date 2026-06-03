// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title BetterDev Reputation Registry
/// @notice Append-only reputation events tied to canonical BetterDev member IDs.
contract ReputationRegistry is Ownable {
    struct ReputationEvent {
        string memberId;
        uint256 eventType;
        uint256 points;
        address issuer;
        string proofURI;
        uint256 timestamp;
    }

    ReputationEvent[] private _events;
    mapping(address => bool) public verifiers;
    mapping(string => uint256) private _reputationOf;

    event VerifierSet(address indexed verifier, bool allowed);
    event ReputationEventRecorded(
        uint256 indexed eventId,
        string indexed memberId,
        uint256 indexed eventType,
        uint256 points,
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

    function recordEvent(string calldata memberId, uint256 eventType, uint256 points, string calldata proofURI)
        external
        onlyVerifier
        returns (uint256 eventId)
    {
        require(bytes(memberId).length > 0, "Invalid member ID");
        require(points > 0, "Invalid points");

        eventId = _events.length;
        _events.push(
            ReputationEvent({
                memberId: memberId,
                eventType: eventType,
                points: points,
                issuer: msg.sender,
                proofURI: proofURI,
                timestamp: block.timestamp
            })
        );

        _reputationOf[memberId] += points;

        emit ReputationEventRecorded(eventId, memberId, eventType, points, msg.sender, proofURI);
    }

    function reputationOf(string calldata memberId) external view returns (uint256) {
        return _reputationOf[memberId];
    }

    function eventCount() external view returns (uint256) {
        return _events.length;
    }

    function reputationEvent(uint256 eventId) external view returns (ReputationEvent memory) {
        require(eventId < _events.length, "Unknown event");
        return _events[eventId];
    }
}
