const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
require("@nomicfoundation/hardhat-chai-matchers");

describe("Casino contract testing", function () {
  const TOKEN_PRICE = ethers.parseEther("0.00003");

  async function deployCasinoFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, user1] = await ethers.getSigners();
    const Casino = await ethers.getContractFactory("Casino");
    const casino = await Casino.deploy();

    // Retrieve the token address from the deployed casino contract
    const tokenAddress = await casino.tokenAddress();
    const CasinoToken = await ethers.getContractFactory("CasinoToken");
    const token = CasinoToken.attach(tokenAddress);
    return { casino, token, owner, user1, tokenAddress };
  }

  async function deployCasinoAndBuyTokensFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, user1] = await ethers.getSigners();
    const Casino = await ethers.getContractFactory("Casino");
    const casino = await Casino.deploy();

    // Retrieve the token address from the deployed casino contract
    const tokenAddress = await casino.tokenAddress();
    const CasinoToken = await ethers.getContractFactory("CasinoToken");
    const token = CasinoToken.attach(tokenAddress);
    const etherGiven = ethers.parseEther("1");
    const numberOfTokens = 30000;
    await casino
      .connect(user1)
      .buyTokens(numberOfTokens, { value: etherGiven });

    return {
      casino,
      token,
      owner,
      user1,
      etherGiven,
      numberOfTokens,
    };
  }

  describe("Casino contract deployment testing", function () {
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
      await expect(casino.connect(user1).playGame(1, 10))
        .to.emit(casino, "PlayerPlayedGame")
        .withArgs(user1.address, 1, 10, 0);
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
    it("Should play game type 1 and lose", async function () {
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

  describe.skip("Withdraw ETH", function () {
    it("Should allow owner to withdraw ETH", async function () {
      await owner.sendTransaction({
        to: casino.address,
        value: ethers.utils.parseEther("1.0"),
      });
      await expect(casino.withdrawEth(1)).to.changeEtherBalance(
        owner,
        ethers.utils.parseEther("1.0")
      );
    });

    it("Should revert if not enough ETH in reserve", async function () {
      await expect(casino.withdrawEth(1)).to.be.revertedWith(
        "Not enough ETH in reserve"
      );
    });
  });

  describe.skip("Fallback function", function () {
    it("Should revert when called with data", async function () {
      const { casino, user1 } = await loadFixture(deployCasinoFixture);

      await expect(
        user1.sendTransaction({
          to: casino.address,
          data: "0x1234", // Sending some arbitrary data
        })
      ).to.be.revertedWith("Contract does not accept Ether transfers");
    });
  });
});
