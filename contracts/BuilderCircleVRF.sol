// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

/// @title BetterDev Builder Circle VRF
/// @notice Requests Chainlink VRF randomness for fair meetup group assignment.
/// @dev The contract stores the verified seed. The app uses that seed to
/// deterministically shuffle attendees into Builder Circles off-chain.
contract BuilderCircleVRF is VRFConsumerBaseV2Plus {
    struct MeetupRandomness {
        bytes32 meetupId;
        uint256 requestId;
        uint256 randomSeed;
        bool fulfilled;
    }

    uint256 public immutable subscriptionId;
    bytes32 public immutable keyHash;
    uint32 public immutable callbackGasLimit;
    uint16 public immutable requestConfirmations;

    mapping(bytes32 => MeetupRandomness) public meetupRandomness;
    mapping(uint256 => bytes32) private requestToMeetup;

    event BuilderCircleRandomnessRequested(bytes32 indexed meetupId, uint256 indexed requestId);
    event BuilderCircleRandomnessFulfilled(bytes32 indexed meetupId, uint256 indexed requestId, uint256 randomSeed);

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

    function requestBuilderCircleRandomness(bytes32 meetupId) external onlyOwner returns (uint256 requestId) {
        require(meetupId != bytes32(0), "Invalid meetup");
        require(!meetupRandomness[meetupId].fulfilled, "Already fulfilled");
        require(meetupRandomness[meetupId].requestId == 0, "Already requested");

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

        requestToMeetup[requestId] = meetupId;
        meetupRandomness[meetupId] = MeetupRandomness({
            meetupId: meetupId,
            requestId: requestId,
            randomSeed: 0,
            fulfilled: false
        });

        emit BuilderCircleRandomnessRequested(meetupId, requestId);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        bytes32 meetupId = requestToMeetup[requestId];
        require(meetupId != bytes32(0), "Unknown request");

        MeetupRandomness storage record = meetupRandomness[meetupId];
        record.randomSeed = randomWords[0];
        record.fulfilled = true;

        emit BuilderCircleRandomnessFulfilled(meetupId, requestId, randomWords[0]);
    }

    function getMeetupSeed(bytes32 meetupId) external view returns (uint256 randomSeed, bool fulfilled) {
        MeetupRandomness memory record = meetupRandomness[meetupId];
        return (record.randomSeed, record.fulfilled);
    }
}
