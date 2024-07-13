// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./NadCasinoToken.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IVRFCoordinatorV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

/**
 * @title NadCasino Smart Contract
 * @author sgnsgn (Alyra's Student)
 * @notice This contract implements a casino game using Chainlink VRF for randomness
 * @dev Inherits from ReentrancyGuard and VRFConsumerBaseV2Plus
 */
contract NadCasino is ReentrancyGuard, VRFConsumerBaseV2Plus {
    // The Chainlink VRF Coordinator contract
    IVRFCoordinatorV2Plus COORDINATOR;

    // The Chainlink VRF subscription ID for requesting randomness
    uint256 s_subscriptionId =
        47528517233559160472381547462063204554242198428552172133546525804592744181403;

    // The Chainlink VRF key hash for requesting randomness
    bytes32 keyHash =
        0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae;

    // max allowed gas for the VRF callback
    uint32 callbackGasLimit = 1_000_000;

    // number of confirmations required for the VRF request
    uint16 requestConfirmations = 3;

    // NadCasinoToken's future instance
    NadCasinoToken private token;

    // Constant Token Price
    uint256 public constant TOKEN_PRICE = 0.00003 ether;

    // Token address
    address public tokenAddress;

    // Player structure (totalGains, biggestWin, nbGames, nbGamesWins)
    struct Player {
        uint256 totalGains; // Total gains accumulated by the player
        uint256 biggestWin; // Biggest single win amount by the player
        uint256 nbGames; // Number of games played by the player
        uint256 nbGamesWins; // Number of games won by the player
    }

    // Mapping of players
    mapping(address => Player) public players;

    // Mappings for the interaction with Chainlink VRF
    mapping(uint256 => address) public requestIdToPlayer;
    mapping(address => uint256) public playerBetAmount;
    mapping(address => uint256) public playerGameType;

    // Globals variables
    uint256 public biggestSingleWinEver;
    uint256 public biggestTotalWinEver;

    // Events
    event PlayerBoughtTokens(address indexed player, uint256 amount);
    event RandomWordsRequested(
        uint256 indexed requestId,
        address indexed player,
        uint256 gameType,
        uint256 betAmount
    );
    event PlayerPlayedGame(
        address indexed player,
        uint256 gameType,
        uint256 betAmount,
        uint256 winAmount
    );
    event PlayerWon(
        address indexed player,
        uint256 betAmount,
        uint256 winAmount
    );
    event PlayerLost(address indexed player, uint256 betAmount);
    event PlayerWithdrewTokens(address indexed player, uint256 amount);
    event PlayerBecameInactive(address indexed player);
    event PlayerGetBackEthers(address indexed player, uint256 amount);

    /**
     * @notice Initializes the contract
     * @param _vrfCoordinator The Chainlink VRF Coordinator address
     * @dev Calls the constructor of VRFConsumerBaseV2Plus
     * Calls the constructor of NadCasinoToken
     * Calls the constructor of the VRFV2PlusClient
     * Sets the token address
     * Mints 1,000,000 tokens
     */
    constructor(
        address _vrfCoordinator
    ) VRFConsumerBaseV2Plus(_vrfCoordinator) {
        COORDINATOR = IVRFCoordinatorV2Plus(_vrfCoordinator);
        token = new NadCasinoToken(address(this));
        token.mint(address(this), 1000000);
        tokenAddress = address(token);
    }

    /**
     * @notice Requests random words from Chainlink VRF
     * @param _numWords Number of random words requested
     * @return requestId The ID of the request
     * @dev Function to request randomness from Chainlink VRF
     */
    function requestRandomWords(
        uint32 _numWords
    ) private returns (uint256 requestId) {
        requestId = COORDINATOR.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: s_subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: _numWords,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );
    }

    /**
     * @notice Fulfills the random words request from Chainlink VRF
     * @param requestId The ID of the request
     * @param randomWords The array of random words received
     * @dev Function called by Chainlink VRF for setting the random words
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal override {
        address player = requestIdToPlayer[requestId];
        uint256 betAmount = playerBetAmount[player];
        uint256 gameType = playerGameType[player];

        uint256 payoutMultiplier = gameType == 1 ? 7 : 20;
        uint256 payoutProbability = gameType == 1 ? 9 : 25;

        uint256 result = randomWords[0] % payoutProbability;
        uint256 winAmount = 0;

        if (result == 0) {
            winAmount = betAmount * payoutMultiplier;

            players[player].totalGains += winAmount;
            players[player].biggestWin = winAmount > players[player].biggestWin
                ? winAmount
                : players[player].biggestWin;
            players[player].nbGamesWins++;

            if (winAmount > biggestSingleWinEver) {
                biggestSingleWinEver = winAmount;
            }

            if (players[player].totalGains > biggestTotalWinEver) {
                biggestTotalWinEver = players[player].totalGains;
            }

            emit PlayerWon(player, betAmount, winAmount);
            token.transfer(player, winAmount);
        } else {
            emit PlayerLost(player, betAmount);
        }

        players[player].nbGames++;

        emit PlayerPlayedGame(player, gameType, betAmount, winAmount);

        // Clean up
        delete requestIdToPlayer[requestId];
        delete playerBetAmount[player];
        delete playerGameType[player];
    }

    /**
     * @notice Converts tokens to ETH
     * @param _numTokens The number of tokens
     * @dev Function to convert tokens to ETH
     */
    function convertTokens(uint256 _numTokens) internal pure returns (uint256) {
        return _numTokens * TOKEN_PRICE;
    }

    /**
     * @notice Allows a player to buy tokens with ETH
     * @param _numTokens The number of tokens to buy
     * @dev Checks for minimum purchase, correct ETH amount, balance of the contract and ownership limits
     */
    function buyTokens(uint256 _numTokens) external payable nonReentrant {
        require(_numTokens >= 10, "You can not buy less than 10 tokens");
        require(
            msg.value >= TOKEN_PRICE * 10,
            "You can't send less than 0.0003 ETH, you can not buy less than 10 tokens"
        );
        require(
            msg.value >= convertTokens(_numTokens),
            "You need more eth for this quantity of tokens"
        );
        require(
            token.balanceOf(address(this)) >= _numTokens,
            "Not enough tokens available for purchase"
        );
        require(
            token.balanceOf(msg.sender) + _numTokens <=
                ((token.totalSupply() * 5) / 100),
            "You cannot own more than 5% of the total supply"
        );

        uint256 tokensToBuy = convertTokens(msg.value);

        token.transfer(msg.sender, _numTokens);

        emit PlayerBoughtTokens(msg.sender, tokensToBuy);
    }

    /**
     * @notice Allows a player to return tokens and receive ETH
     * @param _numTokens The number of tokens to return
     * @dev Checks token balance, contract balance and allowance before transfer
     */
    function devolverTokens(uint256 _numTokens) external nonReentrant {
        require(
            _numTokens > 0,
            "You need to return a number of tokens greater than 0"
        );
        require(
            _numTokens <= token.balanceOf(msg.sender),
            "Insufficient token balance"
        );
        require(
            token.allowance(msg.sender, address(this)) >= _numTokens,
            "Allowance not set or insufficient"
        );

        require(
            address(this).balance >= convertTokens(_numTokens),
            "Insufficient ETH balance in contract to pay for returned tokens"
        );

        token.transferFrom(msg.sender, address(this), _numTokens);

        emit PlayerWithdrewTokens(msg.sender, _numTokens);

        (bool successSendEth, ) = msg.sender.call{
            value: convertTokens(_numTokens)
        }("");
        require(successSendEth, "Failed to send ethers");

        emit PlayerGetBackEthers(msg.sender, convertTokens(_numTokens));

        if (token.balanceOf(msg.sender) == 0) {
            emit PlayerBecameInactive(msg.sender);
        }
    }

    /**
     * @notice Initiates a game play
     * @param gameType The type of game to play (1 or 2)
     * @param betAmount The amount of tokens to bet
     * @dev Requests random words from Chainlink VRF
     */
    function playGame(
        uint256 gameType,
        uint256 betAmount
    ) external nonReentrant {
        require(betAmount > 0, "Bet amount must be greater than zero");
        require(
            betAmount <= token.balanceOf(msg.sender),
            "Insufficient tokens balance"
        );
        require(gameType == 1 || gameType == 2, "Invalid game type");
        require(
            betAmount % 3 == 0 || gameType != 2,
            "Bet amount for gameType 2 must be a multiple of 3 tokens"
        );
        require(
            token.allowance(msg.sender, address(this)) >= betAmount,
            "Allowance not set or insufficient"
        );

        uint256 payoutMultiplier = gameType == 1 ? 7 : 20;
        uint256 potentialWinTokens = betAmount * payoutMultiplier;
        checkContractSolvency(potentialWinTokens, msg.sender);

        token.transferFrom(msg.sender, address(this), betAmount);

        uint256 requestId = requestRandomWords(1);
        requestIdToPlayer[requestId] = msg.sender;
        playerBetAmount[msg.sender] = betAmount;
        playerGameType[msg.sender] = gameType;

        emit RandomWordsRequested(requestId, msg.sender, gameType, betAmount);
    }

    /**
     * @notice Checks if the contract has enough tokens to pay the potential win
     * @param _potentialWinTokens The amount of tokens to pay
     * @param _playerAddress The address of the player
     */
    function checkContractSolvency(
        uint256 _potentialWinTokens,
        address _playerAddress
    ) internal view {
        require(
            token.balanceOf(address(this)) >= _potentialWinTokens,
            "Contract cannot pay potential win in tokens"
        );
        uint256 playerBalanceTokens = token.balanceOf(_playerAddress);
        uint256 potentialWinEthCost = convertTokens(_potentialWinTokens) +
            convertTokens(playerBalanceTokens);
        require(
            address(this).balance >= potentialWinEthCost,
            "Contract cannot pay potential win in Ether"
        );
    }

    /**
     * @notice Withdraws ETH from the contract (OnlyOwner)
     * @param amount The amount of ETH to withdraw
     */
    function withdrawEth(uint256 amount) external onlyOwner {
        require(
            address(this).balance >= amount * 1 ether,
            "Not enough ETH in reserve"
        );
        (bool success, ) = payable(msg.sender).call{value: amount * 1 ether}(
            ""
        );
        require(success, "Transfer failed");
    }

    /**
     * @notice Fallback function (No calls with data available)
     */
    fallback() external payable {
        revert("Fallback function does not accept calls with data");
    }

    /**
     * @notice Receive function (No ETH direct transfers)
     */
    receive() external payable {
        revert("Contract does not accept plain Ether transfers");
    }
}
