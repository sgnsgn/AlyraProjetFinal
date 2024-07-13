// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../NadCasino.sol";

/**
 * @title CasinoTest
 * @dev Contract extension of NadCasino for testing purposes, providing additional setter functions to manipulate internal state.
 */
contract CasinoTest is NadCasino {
    /**
     * @dev Constructor that initializes the contract with the given VRF Coordinator address.
     * @param _vrfCoordinator The address of the VRF Coordinator.
     */
    constructor(address _vrfCoordinator) NadCasino(_vrfCoordinator) {}

    /**
     * @dev Sets the requestId to player mapping for testing purposes.
     * @param requestId The request ID to associate with the player.
     * @param player The address of the player to associate with the request ID.
     */
    function testSetRequestIdToPlayer(
        uint256 requestId,
        address player
    ) external {
        requestIdToPlayer[requestId] = player;
    }

    /**
     * @dev Sets the bet amount for a player for testing purposes.
     * @param player The address of the player whose bet amount is being set.
     * @param amount The amount of the bet to set for the player.
     */
    function testSetPlayerBetAmount(address player, uint256 amount) external {
        playerBetAmount[player] = amount;
    }

    /**
     * @dev Sets the game type for a player for testing purposes.
     * @param player The address of the player whose game type is being set.
     * @param gameType The type of game to set for the player (1 or 2).
     */
    function testSetPlayerGameType(address player, uint8 gameType) external {
        playerGameType[player] = gameType;
    }

    /**
     * @dev Calls the fulfillRandomWords function with arbitrary random words for testing purposes.
     * @param requestId The request ID for which the random words are being fulfilled.
     * @param randomWords The array of random words to fulfill the request with.
     */
    function testFulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) external {
        fulfillRandomWords(requestId, randomWords);
    }
}
