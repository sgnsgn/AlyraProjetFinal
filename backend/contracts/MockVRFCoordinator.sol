// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";

contract MockVRFCoordinator {
    uint256 private requestId = 1;
    mapping(uint256 => address) public requestIdToSender;

    function requestRandomWords(
        bytes32 keyHash,
        uint256 subId,
        uint16 requestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords,
        bytes memory extraArgs
    ) external returns (uint256) {
        requestIdToSender[requestId] = msg.sender;
        return requestId++;
    }

    function fulfillRandomWords(
        uint256 _requestId,
        address _consumer,
        uint256[] memory _randomWords
    ) public {
        VRFConsumerBaseV2Plus(_consumer).rawFulfillRandomWords(
            _requestId,
            _randomWords
        );
    }
}
