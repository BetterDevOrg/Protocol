// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

interface IVRFConsumerV2PlusMock {
    function rawFulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) external;
}

/// @dev Minimal VRF coordinator for local Hardhat tests.
contract MockVRFCoordinatorV2Plus {
    uint256 private nextRequestId = 1;
    mapping(uint256 => address) private consumers;

    function requestRandomWords(
        VRFV2PlusClient.RandomWordsRequest calldata
    ) external returns (uint256 requestId) {
        requestId = nextRequestId++;
        consumers[requestId] = msg.sender;
    }

    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) external {
        address consumer = consumers[requestId];
        require(consumer != address(0), "Unknown request");
        IVRFConsumerV2PlusMock(consumer).rawFulfillRandomWords(requestId, randomWords);
    }
}
