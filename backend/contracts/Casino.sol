// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./CasinoToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Casino is Ownable, ReentrancyGuard {
    CasinoToken private token;
    uint256 public constant TOKEN_PRICE = 0.00003 ether;
    address public tokenAddress;

    struct Player {
        uint256 totalGains; // Total gains accumulated by the player
        uint256 biggestWin; // Biggest single win amount by the player
        uint256 nbGames; // Number of games played by the player
        uint256 nbGamesWins; // Number of games won by the player
    }

    mapping(address => Player) public players;

    uint256 public biggestSingleWinEver;
    uint256 public biggestTotalWinEver;

    event PlayerBoughtTokens(address indexed player, uint256 amount);
    event PlayerPlayedGame(
        address indexed player,
        uint8 gameType,
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

    constructor() Ownable(msg.sender) {
        token = new CasinoToken(address(this));
        token.mint(address(this), 1000000);
        tokenAddress = address(token);
    }

    function convertTokens(uint256 _numTokens) internal pure returns (uint256) {
        return _numTokens * TOKEN_PRICE;
    }

    // Buy tokens by sending ETH
    function buyTokens(uint256 _numTokens) public payable nonReentrant {
        require(_numTokens >= 10, "You can not buy less than 10 tokens");
        require(
            msg.value >= TOKEN_PRICE * 10,
            "You can't send less than 0.0003 ETH, you can not buy less than 10 tokens"
        );
        require(
            msg.value >= convertTokens(_numTokens),
            "You need more eth for this quantity of tokens"
        );
        // Check if the contract has enough tokens for the purchase
        require(
            token.balanceOf(address(this)) >= _numTokens,
            "Not enough tokens available for purchase"
        );
        // Check if the buyer would own more than 5% of the total supply
        require(
            token.balanceOf(msg.sender) + _numTokens <=
                ((token.totalSupply() * 5) / 100),
            "You cannot own more than 5% of the total supply"
        );

        uint256 tokensToBuy = convertTokens(msg.value);

        token.transfer(msg.sender, _numTokens);

        emit PlayerBoughtTokens(msg.sender, tokensToBuy);
    }

    // Return tokens to the Smart Contract
    function devolverTokens(uint256 _numTokens) public nonReentrant {
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

        // Effects: Transfer tokens to the Smart Contract
        token.transferFrom(msg.sender, address(this), _numTokens);

        // Effects: Emit event for token withdrawal
        emit PlayerWithdrewTokens(msg.sender, _numTokens);

        // Interactions: Transfer ethers to the user
        // payable(msg.sender).transfer(convertTokens(_numTokens));
        (bool successSendEth, ) = msg.sender.call{
            value: convertTokens(_numTokens)
        }("");
        require(successSendEth, "Failed to send ethers");

        emit PlayerGetBackEthers(msg.sender, convertTokens(_numTokens));

        if (token.balanceOf(msg.sender) == 0) {
            emit PlayerBecameInactive(msg.sender);
        }
    }

    // Play the game with specified bet amount and game type
    function playGame(uint8 gameType, uint256 betAmount) public nonReentrant {
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

        uint256 payoutMultiplier = gameType == 1 ? 10 : 50;
        uint256 payoutProbability = gameType == 1 ? 9 : 25;

        uint256 potentialWinTokens = betAmount * payoutMultiplier;
        checkContractSolvency(potentialWinTokens, msg.sender);

        // Deduct the tokens to the buyer
        token.transferFrom(msg.sender, address(this), betAmount);

        uint256 result = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender))
        ) % payoutProbability;
        uint256 winAmount = 0;

        if (result == 0) {
            winAmount = betAmount * payoutMultiplier;

            players[msg.sender].totalGains += winAmount;
            players[msg.sender].biggestWin = winAmount >
                players[msg.sender].biggestWin
                ? winAmount
                : players[msg.sender].biggestWin;
            players[msg.sender].nbGamesWins++;

            if (winAmount > biggestSingleWinEver) {
                biggestSingleWinEver = winAmount;
            }

            if (players[msg.sender].totalGains > biggestTotalWinEver) {
                biggestTotalWinEver = players[msg.sender].totalGains;
            }

            token.transfer(msg.sender, winAmount);

            emit PlayerWon(msg.sender, betAmount, winAmount);
        } else {
            emit PlayerLost(msg.sender, betAmount);
        }

        // Increment the number of games played by the player
        players[msg.sender].nbGames++;

        emit PlayerPlayedGame(msg.sender, gameType, betAmount, winAmount);
    }

    function checkContractSolvency(
        uint256 _potentialWinTokens,
        address _playerAddress
    ) internal view {
        // Vérification que le contrat a assez de tokens pour le paiement potentiel
        require(
            token.balanceOf(address(this)) >= _potentialWinTokens,
            "Contract cannot pay potential win in tokens"
        );

        // Récupération de la balance en tokens du joueur
        uint256 playerBalanceTokens = token.balanceOf(_playerAddress);

        // Calcul du coût en ether du paiement potentiel en tokens
        uint256 potentialWinEthCost = convertTokens(_potentialWinTokens) +
            convertTokens(playerBalanceTokens);

        // Vérification que le contrat a assez d'ether pour couvrir le paiement potentiel
        require(
            address(this).balance >= potentialWinEthCost,
            "Contract cannot pay potential win in Ether"
        );
    }

    function withdrawEth(uint256 amount) public onlyOwner nonReentrant {
        require(
            address(this).balance >= amount * 1 ether,
            "Not enough ETH in reserve"
        );
        (bool success, ) = payable(msg.sender).call{value: amount * 1 ether}(
            ""
        );
        require(success, "Transfer failed");
    }

    fallback() external payable {
        revert("Fallback function does not accept calls with data");
    }

    receive() external payable {
        revert("Contract does not accept plain Ether transfers");
    }
}
