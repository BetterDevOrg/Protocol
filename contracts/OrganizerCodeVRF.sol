// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

/// @title BetterDev Organizer Code VRF
/// @notice Chainlink VRF randomness for verifiable city organizer codes.
/// @dev The app derives a human-readable code from the on-chain seed tied to organizerId.
contract OrganizerCodeVRF is VRFConsumerBaseV2Plus {
    struct OrganizerCodeRandomness {
        bytes32 organizerKey;
        uint256 requestId;
        uint256 randomSeed;
        bool fulfilled;
    }

    uint256 public immutable subscriptionId;
    bytes32 public immutable keyHash;
    uint32 public immutable callbackGasLimit;
    uint16 public immutable requestConfirmations;

    mapping(bytes32 => OrganizerCodeRandomness) public organizerRandomness;
    mapping(uint256 => bytes32) private requestToOrganizer;

    event OrganizerCodeRandomnessRequested(bytes32 indexed organizerKey, uint256 indexed requestId);
    event OrganizerCodeRandomnessFulfilled(bytes32 indexed organizerKey, uint256 indexed requestId, uint256 randomSeed);

    constructor(
        address vrfCoordinator,
        uint256 vrfSubscriptionId,
        bytes32 vrfKeyHash,
        uint32 vrfCallbackGasLimit,
        uint16 vrfRequestConfirmations
    ) VRFConsumerBaseV2Plus(vrfCoordinator) {
        subscriptionId = vrfSubscriptionId;
        keyHash = vrfKeyHash;
        callbackGasLimit = vrfCallbackGasLimit;
        requestConfirmations = vrfRequestConfirmations;
    }

    function requestOrganizerCodeRandomness(bytes32 organizerKey) external onlyOwner returns (uint256 requestId) {
        require(organizerKey != bytes32(0), "Invalid organizer");
        require(!organizerRandomness[organizerKey].fulfilled, "Already fulfilled");
        require(organizerRandomness[organizerKey].requestId == 0, "Already requested");

        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: 1,
                extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: false}))
            })
        );

        requestToOrganizer[requestId] = organizerKey;
        organizerRandomness[organizerKey] = OrganizerCodeRandomness({
            organizerKey: organizerKey,
            requestId: requestId,
            randomSeed: 0,
            fulfilled: false
        });

        emit OrganizerCodeRandomnessRequested(organizerKey, requestId);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        bytes32 organizerKey = requestToOrganizer[requestId];
        require(organizerKey != bytes32(0), "Unknown request");

        OrganizerCodeRandomness storage record = organizerRandomness[organizerKey];
        record.randomSeed = randomWords[0];
        record.fulfilled = true;

        emit OrganizerCodeRandomnessFulfilled(organizerKey, requestId, randomWords[0]);
    }

    function getOrganizerCodeSeed(bytes32 organizerKey) external view returns (uint256 randomSeed, bool fulfilled) {
        OrganizerCodeRandomness memory record = organizerRandomness[organizerKey];
        return (record.randomSeed, record.fulfilled);
    }
}
