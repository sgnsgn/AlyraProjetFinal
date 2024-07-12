// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {IVRFCoordinatorV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VRFCoordinatorV2MyMock is IVRFCoordinatorV2Plus, Ownable {
    // Define your variables and events here
    event RandomWordsRequested(
        bytes32 indexed keyHash,
        uint256 requestId,
        uint256 preSeed,
        uint64 indexed subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords,
        address indexed sender
    );
    event RandomWordsFulfilled(
        uint256 indexed requestId,
        uint256 outputSeed,
        uint96 payment,
        bool success
    );

    struct Request {
        uint64 subId;
        uint32 callbackGasLimit;
        uint32 numWords;
    }

    mapping(uint256 => Request) private s_requests;
    uint256 private s_nextRequestId = 1;

    function requestRandomWords(
        bytes32 _keyHash,
        uint64 _subId,
        uint16 _minimumRequestConfirmations,
        uint32 _callbackGasLimit,
        uint32 _numWords
    ) external override returns (uint256 requestId) {
        requestId = s_nextRequestId++;
        s_requests[requestId] = Request({
            subId: _subId,
            callbackGasLimit: _callbackGasLimit,
            numWords: _numWords
        });
        emit RandomWordsRequested(
            _keyHash,
            requestId,
            uint256(keccak256(abi.encode(requestId))),
            _subId,
            _minimumRequestConfirmations,
            _callbackGasLimit,
            _numWords,
            msg.sender
        );
    }

    function fulfillRandomWords(uint256 requestId, address consumer) external {
        Request memory req = s_requests[requestId];
        require(req.numWords > 0, "Request not found");
        uint256[] memory randomWords = new uint256[](req.numWords);
        for (uint256 i = 0; i < req.numWords; i++) {
            randomWords[i] = uint256(keccak256(abi.encode(requestId, i)));
        }
        IVRFCoordinatorV2Plus(consumer).rawFulfillRandomWords(
            requestId,
            randomWords
        );
        emit RandomWordsFulfilled(
            requestId,
            uint256(keccak256(abi.encode(requestId))),
            0,
            true
        );
    }
}
