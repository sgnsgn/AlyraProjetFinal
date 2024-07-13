# NadCasino Smart Contract

This repository contains the smart contract `NadCasino.sol` along with its associated frontend. This project was developed as a final project for Alyra and includes both backend and frontend components.

## Introduction

The `NadCasino` smart contract provides a decentralized casino where players can buy tokens, return tokens, and play games with those tokens.  
The contract uses Chainlink VRF for generating random numbers to ensure fair play.

## Test Summary

Below are the tests performed to ensure the proper functioning of the `NadCasino` contract:

### 1. Deployment

- **Should return the correct decimals**: Verify that the token decimals are correctly set.
- **Should set the right owner**: Verify that the owner is the deployment address.
- **Should not set another owner**: Verify that no other address is set as owner.
- **Should have initial token supply minted**: Verify that the initial token supply is 1,000,000.
- **Should have initial token balance**: Verify that the contract has the correct initial token balance.
- **Should have TOKEN_PRICE set correctly**: Verify that the token price is correctly initialized.
- **Player totalGains should be 0 at deployment**: Verify that players' total gains are initialized to 0.
- **Player biggestWin should be 0 at deployment**: Verify that players' biggest wins are initialized to 0.
- **Player nbGames should be 0 at deployment**: Verify that the number of games played by players is initialized to 0.
- **Player nbGamesWins should be 0 at deployment**: Verify that the number of games won by players is initialized to 0.
- **Should have biggestSingleWinEver set to 0**: Verify that the biggest single win ever is initialized to 0.
- **Should have biggestTotalWinEver set to 0**: Verify that the biggest total win ever is initialized to 0.

### 2. Buying Tokens

- **Should allow buying tokens with sufficient ETH**: Verify that tokens can be bought with sufficient ETH.
- **Should revert if the amount is less than the price of 10 tokens**: Verify that buying is reverted if the amount is less than the price of 10 tokens.
- **Should revert if less than 10 tokens are bought**: Verify that buying is reverted if less than 10 tokens are bought.
- **Should revert if ETH sent are not enough for this quantity of tokens**: Verify that buying is reverted if the ETH sent is insufficient.
- **Should revert if not enough tokens are available for purchase**: Verify that buying is reverted if there are not enough tokens available.
- **Should revert if the supply after the purchase is greater than 5%**: Verify that buying is reverted if the user would own more than 5% of the total supply after the purchase.

### 3. Returning Tokens

- **Should return tokens if allowance is sufficient**: Verify that tokens are returned if the allowance is sufficient.
- **Should revert if returning more tokens than owned**: Verify that returning is reverted if more tokens than owned are returned.
- **Should revert if returning zero tokens**: Verify that returning is reverted if zero tokens are returned.
- **Should revert if the contract does not have enough ETH balance to pay for returned tokens**: Verify that returning is reverted if the contract does not have enough ETH balance to pay for returned tokens.
- **Should emit PlayerBecameInactive if player returns all tokens**: Verify that the PlayerBecameInactive event is emitted if the player returns all tokens.
- **Should revert if allowance is not set**: Verify that returning is reverted if the allowance is not set.
- **Should revert if allowance is less than the number of tokens to be returned**: Verify that returning is reverted if the allowance is less than the number of tokens to be returned.

### 4. Playing Games

- **Should revert if allowance is not set**: Verify that the game is reverted if the allowance is not set.
- **Should revert if allowance is less than the bet amount**: Verify that the game is reverted if the allowance is less than the bet amount.
- **Should revert if bet amount is zero**: Verify that the game is reverted if the bet amount is zero.
- **Should revert if bet amount is more than player's balance**: Verify that the game is reverted if the bet amount is more than the player's balance.
- **Should revert if game type is invalid**: Verify that the game is reverted if the game type is invalid.
- **Should revert if bet amount for game type 2 is not a multiple of 3**: Verify that the game is reverted if the bet amount for game type 2 is not a multiple of 3.

### 5. Solvency Check

- **Should revert if contract cannot pay potential win in tokens**: Verify that the game is reverted if the contract cannot pay the potential win in tokens.
- **Should revert if contract cannot pay potential win in Ether**: Verify that the game is reverted if the contract cannot pay the potential win in Ether.

### 6. Withdraw ETH

- **Should allow owner to withdraw ETH**: Verify that the owner can withdraw ETH.
- **Should revert when non-authorized user tries to withdraw ETH**: Verify that the withdrawal is reverted for non-authorized users.
- **Should revert if not enough ETH in reserve**: Verify that the withdrawal is reverted if there is not enough ETH in reserve.

### 7. Mint Function

- **Should revert when a non-authorized user tries to mint**: Verify that minting is reverted for non-authorized users.

### 8. Receive Function

- **Should revert when Ether is sent directly to the contract**: Verify that direct Ether transfers to the contract are reverted.

### 9. Casino Results playGame testing with the Contract Mock

- **VRFCoordinatorV2_5Mock Fixture testing**

  - **Should deploy VRFCoordinatorV2_5Mock with correct initial setup**: Verify that VRFCoordinatorV2_5Mock is deployed correctly.

- **Testing variables after the FulfillRandomWords's answer for the game 1**

  - **Should update the variables nbGames, nbGamesWins, totalGains after the answer of VRF if the game is won**: Verify that the variables are updated correctly if the game is won.
  - **Should update the variables nbGames, nbGamesWins, totalGains after the answer of VRF if the game is lost**: Verify that the variables are updated correctly if the game is lost.
  - **Should emit the event PlayerLost after the answer of VRF if the game is Lost**: Verify that the PlayerLost event is emitted if the game is lost.

- **Testing variables after the FulfillRandomWords's answer for the game 2**
  - **Should update the variables nbGames, nbGamesWins, totalGains after the answer of VRF if the game is won**: Verify that the variables are updated correctly if the game is won.
  - **Should update the variables nbGames, nbGamesWins, totalGains after the answer of VRF if the game is lost**: Verify that the variables are updated correctly if the game is lost.
  - **Should emit the event PlayerLost after the answer of VRF if the game is Lost**: Verify that the PlayerLost event is emitted if the game is lost.

## Test Results

- **45 passing**

| File                          | % Stmts    | % Branch   | % Funcs    | % Lines    | Uncovered Lines  |
| ----------------------------- | ---------- | ---------- | ---------- | ---------- | ---------------- |
| contracts/                    | 92.86      | 86.76      | 84.62      | 89.33      |                  |
| NadCasino.sol                 | 92.59      | 86.36      | 80         | 88.89      | ... 296,298,342  |
| NadCasinoToken.sol            | 100        | 100        | 100        | 100        |                  |
| contracts/test/               | 100        | 100        | 100        | 100        |                  |
| CasinoTest.sol                | 100        | 100        | 100        | 100        |                  |
| VRFCoordinatorV2_5Mock.sol    | 100        | 100        | 100        | 100        |                  |
| ----------------------------- | ---------- | ---------- | ---------- | ---------- | ---------------- |
| All files                     | 92.98      | 86.76      | 88.89      | 89.87      |                  |
| ----------------------------- | ---------- | ---------- | ---------- | ---------- | ---------------- |

## Screenshot  
  
![Tests_NadCasino sol](https://github.com/user-attachments/assets/648f955e-8923-4dc1-85e8-0b9c408bd35e)


  
