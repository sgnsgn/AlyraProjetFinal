// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../NadCasino.sol";

contract CasinoTest is NadCasino {
    constructor(address _vrfCoordinator) NadCasino(_vrfCoordinator) {}

    function testSetRequestIdToPlayer(
        uint256 requestId,
        address player
    ) external {
        requestIdToPlayer[requestId] = player;
    }

    function testSetPlayerBetAmount(address player, uint256 amount) external {
        playerBetAmount[player] = amount;
    }

    function testSetPlayerGameType(address player, uint8 gameType) external {
        playerGameType[player] = gameType;
    }

    function testFulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) external {
        fulfillRandomWords(requestId, randomWords);
    }
}
