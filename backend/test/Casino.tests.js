const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
require("@nomicfoundation/hardhat-chai-matchers");
const { expect } = require("chai");

describe("Casino contract testing", function () {
  const TOKEN_PRICE = ethers.parseEther("0.00003");

  async function deployCasinoFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    // Deploy VRFCoordinatorV2_5Mock first
    const VRFCoordinatorV2_5Mock = await ethers.getContractFactory(
      "VRFCoordinatorV2_5Mock"
    );
    const vrfCoordinator = await VRFCoordinatorV2_5Mock.deploy(
      ethers.parseUnits("0.25", "ether"), // _baseFee
      ethers.parseUnits("1", "gwei"), // _gasPrice
      ethers.parseUnits("1", 18) // _weiPerUnitLink
    );

    // Deploy the Casino contract
    const Casino = await ethers.getContractFactory("Casino");
    const casino = await Casino.deploy(vrfCoordinator.getAddress());

    // Retrieve the token address from the deployed casino contract
    const tokenAddress = await casino.tokenAddress();
    const CasinoToken = await ethers.getContractFactory("CasinoToken");
    const token = CasinoToken.attach(tokenAddress);

    return {
      casino,
      token,
      owner,
      user1,
      user2,
      tokenAddress,
      VRFCoordinatorV2_5Mock: vrfCoordinator,
    };
  }

  async function deployCasinoAndBuyTokensFixture() {
    const { casino, token, owner, user1, user2 } = await loadFixture(
      deployCasinoFixture
    );
    const etherGiven = ethers.parseEther("1");
    const numberOfTokens = 30000;
    await casino
      .connect(user1)
      .buyTokens(numberOfTokens, { value: etherGiven });
    await casino
      .connect(user2)
      .buyTokens(numberOfTokens, { value: etherGiven });

    return {
      casino,
      token,
      owner,
      user1,
      user2,
      etherGiven,
      numberOfTokens,
    };
  }

  describe.only("Casino contract deployment testing", function () {
    it("Should return the correct decimals", async function () {
      const { token } = await loadFixture(deployCasinoFixture);
      expect(await token.decimals()).to.equal(0);
    });
    it("Should set the right owner", async function () {
      const { casino, owner } = await loadFixture(deployCasinoFixture);
      expect(await casino.owner()).to.equal(owner.address);
    });

    it("Should not set another owner", async function () {
      const { casino, user1 } = await loadFixture(deployCasinoFixture);
      expect(await casino.owner()).to.not.equal(user1.address);
    });

    it("Should have initial token supply minted", async function () {
      const { token } = await loadFixture(deployCasinoFixture);
      expect(await token.totalSupply()).to.equal(1000000);
    });

    // take care it doesnt verify the initial token balance of the contract .. WIP
    it("Should have initial token balance", async function () {
      const { token, tokenAddress, user1, owner } = await loadFixture(
        deployCasinoAndBuyTokensFixture
      );
      // expect(await token.balanceOf(token.address)).to.equal(1000000);
      // expect(await token.balanceOf(tokenAddress)).to.equal(1000000);
      // expect(await token.balanceOf(token)).to.equal(1000000);
      // expect(await token.balanceOf(owner)).to.equal(1000000);
      expect(await token.balanceOf(user1)).to.equal(30000);
    });

    it("Should have TOKEN_PRICE set correctly", async function () {
      const { casino } = await loadFixture(deployCasinoFixture);
      expect(await casino.TOKEN_PRICE()).to.equal(TOKEN_PRICE);
    });

    it("Player totalGains should be 0 at deployment", async function () {
      const { casino, user1 } = await loadFixture(deployCasinoFixture);
      const player = await casino.players(user1.address);
      expect(player.totalGains).to.equal(0);
    });

    it("Player biggestWin should be 0 at deployment", async function () {
      const { casino, user1 } = await loadFixture(deployCasinoFixture);
      const player = await casino.players(user1.address);
      expect(player.biggestWin).to.equal(0);
    });

    it("Player nbGames should be 0 at deployment", async function () {
      const { casino, user1 } = await loadFixture(deployCasinoFixture);
      const player = await casino.players(user1.address);
      expect(player.nbGames).to.equal(0);
    });

    it("Player nbGamesWins should be 0 at deployment", async function () {
      const { casino, user1 } = await loadFixture(deployCasinoFixture);
      const player = await casino.players(user1.address);
      expect(player.nbGamesWins).to.equal(0);
    });

    it("Should have biggestSingleWinEver set to 0", async function () {
      const { casino } = await loadFixture(deployCasinoFixture);
      expect(await casino.biggestSingleWinEver()).to.equal(0);
    });

    it("Should have biggestTotalWinEver set to 0", async function () {
      const { casino } = await loadFixture(deployCasinoFixture);
      expect(await casino.biggestTotalWinEver()).to.equal(0);
    });
  });

  describe("Buying tokens fonction", function () {
    it("Should allow buying tokens with sufficient ETH", async function () {
      const { casino, token, user1 } = await loadFixture(deployCasinoFixture);
      const etherGiven = ethers.parseEther("1");
      await casino.connect(user1).buyTokens(30000, { value: etherGiven });
      expect(await token.balanceOf(user1.address)).to.equal(30000);
    });

    it("Should revert if the amount is less than the price of 10 tokens", async function () {
      const { casino, user1 } = await loadFixture(deployCasinoFixture);
      const etherGiven = ethers.parseEther("0.00003");
      await expect(
        casino.connect(user1).buyTokens(10, { value: etherGiven })
      ).to.be.revertedWith(
        "You can't send less than 0.0003 ETH, you can not buy less than 10 tokens"
      );
    });

    it("Should revert if less than 10 tokens are bought", async function () {
      const { casino, user1 } = await loadFixture(deployCasinoFixture);
      const etherGiven = ethers.parseEther("1");
      await expect(
        casino.connect(user1).buyTokens(5, { value: etherGiven })
      ).to.be.revertedWith("You can not buy less than 10 tokens");
    });

    it("Should revert if ETH send are not enough for this quantity of tokens", async function () {
      const { casino, user1 } = await loadFixture(deployCasinoFixture);
      const etherGiven = ethers.parseEther("1");
      await expect(
        casino.connect(user1).buyTokens(50000, { value: etherGiven })
      ).to.be.revertedWith("You need more eth for this quantity of tokens");
    });

    it("Should revert if not enough tokens are available for purchase", async function () {
      const { casino, user1 } = await loadFixture(deployCasinoFixture);
      const etherGiven = ethers.parseEther("100");
      await expect(
        casino.connect(user1).buyTokens(3000000, { value: etherGiven })
      ).to.be.revertedWith("Not enough tokens available for purchase");
    });

    it("Should revert if the supply after the purchase is greater than 5%", async function () {
      const { casino, user1 } = await loadFixture(deployCasinoFixture);
      const etherGiven = ethers.parseEther("2");
      await expect(
        casino.connect(user1).buyTokens(60000, { value: etherGiven })
      ).to.be.revertedWith("You cannot own more than 5% of the total supply");
    });
  });

  describe("Returning tokens", function () {
    it("Should return tokens if allowance is sufficient", async function () {
      const { casino, token, user1, numberOfTokens } = await loadFixture(
        deployCasinoAndBuyTokensFixture
      );
      await token.connect(user1).approve(casino, 10);
      await expect(casino.connect(user1).devolverTokens(10))
        .to.emit(casino, "PlayerWithdrewTokens")
        .withArgs(user1.address, 10);

      expect(await token.balanceOf(user1.address)).to.equal(
        numberOfTokens - 10
      );
    });

    it("Should revert if returning more tokens than owned", async function () {
      const { casino, user1 } = await loadFixture(
        deployCasinoAndBuyTokensFixture
      );
      await expect(
        casino.connect(user1).devolverTokens(40000)
      ).to.be.revertedWith("Insufficient token balance");
    });

    it("Should revert if returning zero tokens", async function () {
      const { casino, user1 } = await loadFixture(
        deployCasinoAndBuyTokensFixture
      );
      await expect(casino.connect(user1).devolverTokens(0)).to.be.revertedWith(
        "You need to return a number of tokens greater than 0"
      );
    });

    it("Should emit PlayerBecameInactive if player returns all tokens", async function () {
      const { casino, token, user1 } = await loadFixture(
        deployCasinoAndBuyTokensFixture
      );
      await token.connect(user1).approve(casino, 30000);
      await expect(casino.connect(user1).devolverTokens(30000))
        .to.emit(casino, "PlayerBecameInactive")
        .withArgs(user1.address);

      expect(await token.balanceOf(user1.address)).to.equal(0);
    });

    it("Should revert if allowance is not set", async function () {
      const { casino, user1 } = await loadFixture(
        deployCasinoAndBuyTokensFixture
      );
      await expect(casino.connect(user1).devolverTokens(10)).to.be.revertedWith(
        "Allowance not set or insufficient"
      );
    });

    it("Should revert if allowance is less than the number of tokens to be returned", async function () {
      const { casino, token, user1 } = await loadFixture(
        deployCasinoAndBuyTokensFixture
      );
      await token.connect(user1).approve(casino, 5);
      await expect(casino.connect(user1).devolverTokens(10)).to.be.revertedWith(
        "Allowance not set or insufficient"
      );
    });
  });

  describe("Playing games", function () {
    it("Should revert if allowance is not set", async function () {
      const { casino, user1 } = await loadFixture(
        deployCasinoAndBuyTokensFixture
      );
      await expect(casino.connect(user1).playGame(1, 10)).to.be.revertedWith(
        "Allowance not set or insufficient"
      );
    });

    it("Should revert if allowance is less than the bet amount", async function () {
      const { casino, token, user1 } = await loadFixture(
        deployCasinoAndBuyTokensFixture
      );
      await token.connect(user1).approve(casino, 5);
      await expect(casino.connect(user1).playGame(1, 10)).to.be.revertedWith(
        "Allowance not set or insufficient"
      );
    });

    it("Should play game if allowance is sufficient", async function () {
      const { casino, token, user1 } = await loadFixture(
        deployCasinoAndBuyTokensFixture
      );
      await token.connect(user1).approve(casino, 10);

      const tokenAdress = await token.getAddress();
      const casinoAdress = await casino.getAddress();

      console.log("lalalali : ", tokenAdress);
      console.log("lalalalu : ", casinoAdress);

      // Jouer le jeu et obtenir le requestId
      const playGameTx = await casino.connect(user1).playGame(1, 10);

      console.log("lalala : ", playGameTx);

      // // Simuler la réponse VRF
      // const randomWords = [12345];
      // await mockVRFCoordinator.fulfillRandomWords(
      //   requestId,
      //   casino.address,
      //   randomWords
      // );

      // // Vérifier que l'événement PlayerPlayedGame est émis avec les paramètres attendus
      // await expect(playGameTx)
      //   .to.emit(casino, "PlayerPlayedGame")
      //   .withArgs(user1.address, 1, 10, 0);
    });

    it("Should play game type 1 and lose tokens", async function () {
      const { casino, token, user1 } = await loadFixture(
        deployCasinoAndBuyTokensFixture
      );
      const betAmount = 3;

      await token.connect(user1).approve(casino, betAmount);
      const initialBalance = await token.balanceOf(user1.address);
      await casino.connect(user1).playGame(1, betAmount);
      const finalBalance = await token.balanceOf(user1.address);

      expect(finalBalance).to.be.lessThan(initialBalance);
    });

    it("Should play game type 1 and check the event for loss", async function () {
      const { casino, token, user1 } = await loadFixture(
        deployCasinoAndBuyTokensFixture
      );
      const betAmount = 3;

      await token.connect(user1).approve(casino, betAmount);

      await expect(casino.connect(user1).playGame(1, betAmount))
        .to.emit(casino, "PlayerLost")
        .withArgs(user1.address, betAmount);
    });

    it("Should play game type 1 multiple times and check the event for win", async function () {
      const { casino, token, user1 } = await loadFixture(
        deployCasinoAndBuyTokensFixture
      );
      const betAmount = 3;

      await token.connect(user1).approve(casino, betAmount * 20); // Approve enough tokens for multiple plays

      let won = false;
      for (let i = 0; i < 20; i++) {
        const tx = casino.connect(user1).playGame(1, betAmount);
        try {
          await expect(tx)
            .to.emit(casino, "PlayerWon")
            .withArgs(user1.address, betAmount, betAmount * 10);
          won = true;
          break;
        } catch (error) {
          // Ignore the error and continue the loop if the event is not emitted
        }
      }

      expect(won).to.be.true;
    });

    it("Should play game type 2 and lose tokens", async function () {
      const { casino, token, user1 } = await loadFixture(
        deployCasinoAndBuyTokensFixture
      );
      const betAmount = 3;

      await token.connect(user1).approve(casino, betAmount);
      const initialBalance = await token.balanceOf(user1.address);
      await casino.connect(user1).playGame(2, betAmount);
      const finalBalance = await token.balanceOf(user1.address);

      expect(finalBalance).to.be.lessThan(initialBalance);
    });

    it("Should play game type 2 and check the event for loss", async function () {
      const { casino, token, user1 } = await loadFixture(
        deployCasinoAndBuyTokensFixture
      );
      const betAmount = 6;

      await token.connect(user1).approve(casino, betAmount);

      await expect(casino.connect(user1).playGame(2, betAmount))
        .to.emit(casino, "PlayerLost")
        .withArgs(user1.address, betAmount);
    });

    it("Should play game type 2 multiple times and check the event for win", async function () {
      const { casino, token, user1 } = await loadFixture(
        deployCasinoAndBuyTokensFixture
      );
      const betAmount = 3;

      await token.connect(user1).approve(casino, betAmount * 100); // Approve enough tokens for multiple plays

      let won = false;
      for (let i = 0; i < 100; i++) {
        const tx = casino.connect(user1).playGame(2, betAmount);
        try {
          await expect(tx)
            .to.emit(casino, "PlayerWon")
            .withArgs(user1.address, betAmount, betAmount * 50);
          won = true;
          break;
        } catch (error) {
          // Ignore the error and continue the loop if the event is not emitted
        }
      }

      expect(won).to.be.true;
    });

    it("Should revert if bet amount is zero", async function () {
      const { casino, user1 } = await loadFixture(
        deployCasinoAndBuyTokensFixture
      );
      await expect(casino.connect(user1).playGame(1, 0)).to.be.revertedWith(
        "Bet amount must be greater than zero"
      );
    });

    it("Should revert if bet amount is more than player's balance", async function () {
      const { casino, user1 } = await loadFixture(
        deployCasinoAndBuyTokensFixture
      );
      await expect(casino.connect(user1).playGame(1, 40000)).to.be.revertedWith(
        "Insufficient tokens balance"
      );
    });

    it("Should revert if game type is invalid", async function () {
      const { casino, user1 } = await loadFixture(
        deployCasinoAndBuyTokensFixture
      );
      await expect(casino.connect(user1).playGame(3, 3)).to.be.revertedWith(
        "Invalid game type"
      );
    });

    it("Should revert if bet amount for game type 2 is not a multiple of 3", async function () {
      const { casino, user1 } = await loadFixture(
        deployCasinoAndBuyTokensFixture
      );
      await expect(casino.connect(user1).playGame(2, 4)).to.be.revertedWith(
        "Bet amount for gameType 2 must be a multiple of 3 tokens"
      );
    });

    it("Should emit PlayerPlayedGame when player plays a game", async function () {
      const { casino, user1, token } = await loadFixture(
        deployCasinoAndBuyTokensFixture
      );

      await token.connect(user1).approve(casino, 3);
      await expect(casino.connect(user1).playGame(1, 3))
        .to.emit(casino, "PlayerPlayedGame")
        .withArgs(user1.address, 1, 3, 0);
    });

    it("Should update the number of games played when player plays a game", async function () {
      const { casino, user1, token } = await loadFixture(
        deployCasinoAndBuyTokensFixture
      );
      await token.connect(user1).approve(casino, 3);
      await casino.connect(user1).playGame(1, 3);
      const player = await casino.players(user1.address);
      expect(player.nbGames).to.equal(1);
    });

    it("Should update player variables and global variables on win", async function () {
      const { casino, token, user1 } = await loadFixture(
        deployCasinoAndBuyTokensFixture
      );
      const betAmount = 3;
      const payoutMultiplier = 10;
      const winAmount = betAmount * payoutMultiplier;

      await token.connect(user1).approve(casino, betAmount * 20); // Approve enough tokens for multiple plays

      let won = false;
      for (let i = 0; i < 20; i++) {
        const tx = casino.connect(user1).playGame(1, betAmount);
        try {
          await expect(tx)
            .to.emit(casino, "PlayerWon")
            .withArgs(user1.address, betAmount, winAmount);
          won = true;
          break;
        } catch (error) {
          // Ignore the error and continue the loop if the event is not emitted
        }
      }

      expect(won).to.be.true;

      // Check player variables
      const player = await casino.players(user1.address);
      expect(player.totalGains).to.equal(winAmount);
      expect(player.biggestWin).to.equal(winAmount);
      expect(player.nbGamesWins).to.equal(1);

      // Check global variables
      expect(await casino.biggestSingleWinEver()).to.equal(winAmount);
      expect(await casino.biggestTotalWinEver()).to.equal(winAmount);
    });

    it("Should update biggestTotalWinEver when a new player surpasses previous totalGains", async function () {
      const { casino, token, user1, user2 } = await loadFixture(
        deployCasinoAndBuyTokensFixture
      );
      const betAmount = 3;
      const payoutMultiplierGame1 = 10;
      const payoutMultiplierGame2 = 50;
      const winAmountGame1 = betAmount * payoutMultiplierGame1;
      const winAmountGame2 = betAmount * payoutMultiplierGame2;

      // Simulate a win for the player 1
      await token.connect(user1).approve(casino, betAmount * 20);
      let user1Won = false;
      for (let i = 0; i < 20; i++) {
        const tx = casino.connect(user1).playGame(1, betAmount);
        try {
          await expect(tx)
            .to.emit(casino, "PlayerWon")
            .withArgs(user1.address, betAmount, winAmountGame1);
          user1Won = true;
          break;
        } catch (error) {
          // Ignore the error and continue the loop if the event is not emitted
        }
      }

      expect(user1Won).to.be.true;

      // Check global variables after player 1's win
      const player1AfterWin = await casino.players(user1.address);
      expect(await casino.biggestTotalWinEver()).to.equal(
        player1AfterWin.totalGains
      );
      expect(await casino.biggestSingleWinEver()).to.equal(winAmountGame1);

      // Simulate a win for the player 2
      await token.connect(user2).approve(casino, betAmount * 50);
      let user2Won = false;
      for (let i = 0; i < 50; i++) {
        const tx = casino.connect(user2).playGame(2, betAmount);
        try {
          await expect(tx)
            .to.emit(casino, "PlayerWon")
            .withArgs(user2.address, betAmount, winAmountGame2);
          user2Won = true;
          break;
        } catch (error) {
          // Ignore the error and continue the loop if the event is not emitted
        }
      }

      expect(user2Won).to.be.true;

      // Check global variables after player 2's win
      const player1 = await casino.players(user1.address);
      const player2 = await casino.players(user2.address);
      expect(player2.totalGains).to.be.greaterThan(player1.totalGains);
      expect(await casino.biggestTotalWinEver()).to.equal(player2.totalGains);
      expect(await casino.biggestSingleWinEver()).to.equal(winAmountGame2);
    });

    it("Should update player1 and global variables after multiple wins", async function () {
      const { casino, token, user1 } = await loadFixture(
        deployCasinoAndBuyTokensFixture
      );
      const betAmount1 = 3;
      const betAmount2 = 5;
      const payoutMultiplier = 10;
      const winAmount1 = betAmount1 * payoutMultiplier;
      const winAmount2 = betAmount2 * payoutMultiplier;

      // Approve enough tokens for multiple plays for user1
      await token.connect(user1).approve(casino, betAmount1 * 20);

      // Simulate a win for player 1 in game type 1
      let user1WonGame1 = false;
      for (let i = 0; i < 20; i++) {
        const tx = casino.connect(user1).playGame(1, betAmount1);
        try {
          await expect(tx)
            .to.emit(casino, "PlayerWon")
            .withArgs(user1.address, betAmount1, winAmount1);
          user1WonGame1 = true;
          break;
        } catch (error) {
          // Ignore the error and continue the loop if the event is not emitted
        }
      }

      expect(user1WonGame1).to.be.true;

      // Check player and global variables after first win
      const player1AfterFirstWin = await casino.players(user1.address);
      expect(player1AfterFirstWin.totalGains).to.equal(winAmount1);
      expect(player1AfterFirstWin.biggestWin).to.equal(winAmount1);
      expect(player1AfterFirstWin.nbGamesWins).to.equal(1);
      expect(await casino.biggestTotalWinEver()).to.equal(winAmount1);
      expect(await casino.biggestSingleWinEver()).to.equal(winAmount1);

      // Approve enough tokens for another win for user1
      await token.connect(user1).approve(casino, betAmount2 * 20);

      // Simulate another win for player 1 in game type 1 with a different bet amount
      let user1WonGame2 = false;
      for (let i = 0; i < 20; i++) {
        const tx = casino.connect(user1).playGame(1, betAmount2);
        try {
          await expect(tx)
            .to.emit(casino, "PlayerWon")
            .withArgs(user1.address, betAmount2, winAmount2);
          user1WonGame2 = true;
          break;
        } catch (error) {
          // Ignore the error and continue the loop if the event is not emitted
        }
      }

      expect(user1WonGame2).to.be.true;

      // Check player and global variables after second win
      const player1AfterSecondWin = await casino.players(user1.address);
      expect(player1AfterSecondWin.totalGains).to.equal(
        winAmount1 + winAmount2
      );
      expect(player1AfterSecondWin.biggestWin).to.equal(winAmount2);
      expect(player1AfterSecondWin.nbGamesWins).to.equal(2);
      expect(await casino.biggestTotalWinEver()).to.equal(
        winAmount1 + winAmount2
      );
      expect(await casino.biggestSingleWinEver()).to.equal(winAmount2);
    });
  });

  describe("Solvency check", function () {
    it("Should revert if contract cannot pay potential win in tokens", async function () {
      const { casino, user1, token } = await loadFixture(
        deployCasinoAndBuyTokensFixture
      );
      await token.connect(user1).approve(casino, 30000);
      await expect(casino.connect(user1).playGame(2, 30000)).to.be.revertedWith(
        "Contract cannot pay potential win in tokens"
      );
    });
    it("Should revert if contract cannot pay potential win in Ether", async function () {
      const { casino, user1, token } = await loadFixture(
        deployCasinoAndBuyTokensFixture
      );
      await token.connect(user1).approve(casino, 10000);
      await expect(casino.connect(user1).playGame(1, 10000)).to.be.revertedWith(
        "Contract cannot pay potential win in Ether"
      );
    });
  });

  describe("Withdraw ETH", function () {
    it("Should allow owner to withdraw ETH", async function () {
      const { casino, owner } = await loadFixture(
        deployCasinoAndBuyTokensFixture
      );
      await expect(casino.connect(owner).withdrawEth(1)).to.changeEtherBalance(
        owner,
        ethers.parseEther("1.0")
      );
    });
    it("Should revert when non authorized user tries to to withdraw ETH", async function () {
      const { casino, user1 } = await loadFixture(
        deployCasinoAndBuyTokensFixture
      );
      await expect(casino.connect(user1).withdrawEth(1)).to.be.reverted;
    });

    it("Should revert if not enough ETH in reserve", async function () {
      const { casino } = await loadFixture(deployCasinoFixture);
      await expect(casino.withdrawEth(1)).to.be.revertedWith(
        "Not enough ETH in reserve"
      );
    });
  });

  // describe.only("Fallback function", function () {
  //   it("Should revert when called with data", async function () {
  //     const { casino, user1 } = await loadFixture(deployCasinoFixture);

  //     await expect(
  //       user1.sendTransaction({
  //         to: casino.address,
  //         data: "0x1234", // Sending some arbitrary data
  //         value: ethers.parseEther("0.1"), // Sending some Ether as well
  //       })
  //     ).to.be.revertedWith("Fallback function does not accept calls with data");
  //   });
  // });

  describe("Mint function", function () {
    it("Should revert when a non authorized user tries to mint", async function () {
      const { token, user1 } = await loadFixture(deployCasinoFixture);
      await expect(token.connect(user1).mint(user1, 10000000)).to.be.reverted;
    });
  });

  describe("Receive function", function () {
    it("Should revert when Ether is sent directly to the contract", async function () {
      const { casino, owner } = await loadFixture(deployCasinoFixture);

      await expect(
        owner.sendTransaction({
          to: casino,
          value: ethers.parseEther("1.0"),
        })
      ).to.be.revertedWith("Contract does not accept plain Ether transfers");
    });
  });

  describe("VRF", async function () {
    it("Should correctly handle a VRF response for a winning game", async function () {
      const { casino, token, user1, VRFCoordinatorV2_5Mock } =
        await loadFixture(deployCasinoAndBuyTokensFixture);

      await token.connect(user1).approve(casino, 10);

      // Jouer le jeu
      const playGameTx = await casino.connect(user1).playGame(1, 10);
      const receipt = await playGameTx.wait();

      // Trouver le requestId
      const requestId = receipt.events.find(
        (e) => e.event === "RandomWordsRequested"
      ).args.requestId;

      // Simuler une réponse VRF gagnante
      const winningNumber = 0; // Assurez-vous que ce nombre correspond à une victoire dans votre logique
      await VRFCoordinatorV2_5Mock.fulfillRandomWords(
        requestId,
        casino.address,
        [winningNumber]
      );

      // Vérifier que le joueur a gagné
      const player = await casino.players(user1.address);
      expect(player.totalGains).to.be.gt(0);
      expect(player.nbGamesWins).to.equal(1);
    });
  });
});
