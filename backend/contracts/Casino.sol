// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./CasinoToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// import for testing in remix
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/ReentrancyGuard.sol";
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

contract Casino is Ownable, ReentrancyGuard {
    CasinoToken private token;
    address public tokenAddress;
    uint256 public constant MAX_DAILY_PAYOUT = 1 ether; // Maximum daily payout
    uint256 private constant TOKEN_PRICE = 0.0003 ether;

    mapping(address => bool) public isAnActiveUser;
    mapping(address => uint256) public playerGains;
    mapping(address => uint256) public dailyPayouts;
    mapping(address => uint256) public lastPayoutReset;

    event PlayerBoughtTokens(address indexed player, uint256 amount);
    event PlayerPlayedGame(
        address indexed player,
        uint8 gameType,
        uint256 betAmount
    );
    event PlayerWon(
        address indexed player,
        uint256 betAmount,
        uint256 WinAmount
    );
    event PlayerLost(address indexed player, uint256 betAmount);
    event PlayerWithdrewTokens(address indexed player, uint256 amount);
    event PlayerBecameInactive(address indexed player);

    constructor() Ownable(msg.sender) {
        token = new CasinoToken("CasinoToken", "CTK");
        tokenAddress = address(token);
        token.mint(1000000);
    }

    function needTokens(uint256 _numTokens) internal pure returns (uint256) {
        return _numTokens * (0.0003 ether);
    }

    function mintNewtokens(uint256 _numTokens) public payable {
        token.mint(_numTokens * 100000);
    }

    // Buy tokens by sending ETH
    function buyTokens(uint256 _numTokens) public payable {
        // Can't send less than 0.0003
        require(
            msg.value >= 0.0003 ether,
            "You can't send less than 0.0003 ETH"
        );
        // Refund excess ether if the buyer sends more than required for purchasing tokens
        require(
            msg.value >= needTokens(_numTokens),
            "You need more eth for this quantity of tokens"
        );

        // Calculate the number of tokens to buy based on ETH sent
        uint256 tokensToBuy = needTokens(msg.value);

        // Mint new tokens if there is not enough supply
        if (token.balanceOf(address(this)) < _numTokens) {
            token.mint(_numTokens * 100000);
        }

        // Transfer tokens to the buyer
        token.transfer(address(this), msg.sender, _numTokens);

        // Update active user status
        isAnActiveUser[msg.sender] = true;

        // Emit event for token purchase
        emit PlayerBoughtTokens(msg.sender, tokensToBuy);
    }

    // Return tokens to the Smart Contract
    function devolverTokens(uint _numTokens) public payable {
        // Check: The number of tokens must be greater than 0
        require(
            _numTokens > 0,
            "You need to return a number of tokens greater than 0"
        );

        // Check: The user must have the tokens they want to return
        require(
            _numTokens <= token.balanceOf(msg.sender),
            "Insufficient token balance"
        );

        // Effects: Transfer tokens to the Smart Contract
        token.transfer(msg.sender, address(this), _numTokens);

        // Effects: Emit event for token withdrawal
        emit PlayerWithdrewTokens(msg.sender, _numTokens);

        // Interactions: Transfer ethers to the user
        payable(msg.sender).transfer(needTokens(_numTokens));

        // Check and Effect: Update active user status if the balance becomes zero
        if (token.balanceOf(msg.sender) == 0) {
            isAnActiveUser[msg.sender] = false;
            emit PlayerBecameInactive(msg.sender);
        }
    }

    // Reset daily payout for a player if a day has passed
    function resetDailyPayout(address player) internal {
        if (block.timestamp - lastPayoutReset[player] > 1 days) {
            dailyPayouts[player] = 0;
            lastPayoutReset[player] = block.timestamp;
        }
    }

    // Play the game with specified bet amount and game type
    function playGame(uint8 gameType, uint256 betAmount) public nonReentrant {
        require(
            betAmount <= token.balanceOf(msg.sender),
            "Insufficient tokens balance for gameType 1"
        );
        require(betAmount > 0, "Bet amount must be greater than zero");

        if (gameType == 1) {
            //
        } else if (gameType == 2) {
            require(
                betAmount % 3 == 0,
                "Bet amount for gameType 2 must be a multiple of 3 tokens"
            );
        } else {
            revert("Invalid game type");
        }

        uint256 payoutMultiplier = gameType == 1 ? 2 : 5;
        uint256 payoutProbability = gameType == 1 ? 9 : 25;

        require(
            getPlayerTokenBalance() >= betAmount,
            "Insufficient token balance"
        );

        // Deduct the tokens to the buyer
        token.transfer(msg.sender, address(this), betAmount);

        uint256 result = uint256(
            keccak256(
                abi.encodePacked(block.timestamp, msg.sender, block.number)
            )
        ) % payoutProbability;
        uint256 WinAmount = 0;
        if (result == 0) {
            WinAmount = betAmount * payoutMultiplier;

            // Réinitialisation du paiement quotidien du joueur
            resetDailyPayout(msg.sender);

            // Vérifie si la limite de paiement quotidien est atteinte
            require(
                dailyPayouts[msg.sender] + WinAmount <= MAX_DAILY_PAYOUT,
                "Daily payout limit reached"
            );

            // Mise à jour des gains du joueur et émission de l'événement
            playerGains[msg.sender] += WinAmount;
            dailyPayouts[msg.sender] += WinAmount;
            emit PlayerWon(msg.sender, betAmount, WinAmount);
        } else {
            emit PlayerLost(msg.sender, betAmount);
            if (token.balanceOf(msg.sender) == 0) {
                isAnActiveUser[msg.sender] = false;
                emit PlayerBecameInactive(msg.sender);
            }
        }

        // Si le joueur gagne, ajoute le paiement à son solde
        if (WinAmount > 0) {
            if (token.balanceOf(address(this)) <= WinAmount) {
                // Mint de nouveaux tokens si nécessaire
                mintNewtokens(WinAmount);
            }
            token.transfer(address(this), msg.sender, WinAmount);
        }

        // Émission de l'événement pour le jeu joué
        emit PlayerPlayedGame(msg.sender, gameType, betAmount);
    }

    // Getter for total supply of the token
    function getTokenSupply() public view returns (uint256) {
        return token.totalSupply();
    }

    // Getter for player's token balance restricted to active users or owner
    function getPlayerTokenBalance() public view returns (uint256) {
        require(
            isAnActiveUser[msg.sender] || msg.sender == owner(),
            "Only active users or the owner can view the balance"
        );
        return token.balanceOf(msg.sender);
    }

    // Getter for player's gains restricted to active users or owner
    function getPlayerGains(address player) public view returns (uint256) {
        require(
            isAnActiveUser[msg.sender] || msg.sender == owner(),
            "Only active users or the owner can view the gains"
        );
        return playerGains[player];
    }

    // Function to check if a player is active
    function isActiveUser(address player) public view returns (bool) {
        return isAnActiveUser[player];
    }

    // Owner can withdraw ETH from the contract
    function withdrawEth(uint256 amount) public onlyOwner nonReentrant {
        require(address(this).balance >= amount, "Not enough ETH in reserve");
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }

    // Fallback function to reject any Ether sent with data
    fallback() external payable {
        revert("Fallback function does not accept calls with data");
    }

    // Receive function to handle plain Ether transfers
    receive() external payable {
        revert("Contract does not accept plain Ether transfers");
    }
}
