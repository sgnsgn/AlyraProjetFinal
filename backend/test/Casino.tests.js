const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
require("@nomicfoundation/hardhat-chai-matchers");
const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe("NadCasino contract testing", function () {
  const TOKEN_PRICE = ethers.parseEther("0.00003");

  async function deployVRFCoordinatorAndCasinoFixtureBeforeTheBought() {
    const [owner, user1] = await ethers.getSigners();

    const BASE_FEE = "1000000000000000"; // 0.001 ether as base fee
    const GAS_PRICE = "50000000000"; // 50 gwei
    const WEI_PER_UNIT_LINK = "10000000000000000"; // 0.01 ether per LINK

    // Déployer le MockVRFCoordinator
    const MockVRFCoordinator = await ethers.getContractFactory(
      "VRFCoordinatorV2_5Mock"
    );
    const mockVRFCoordinator = await MockVRFCoordinator.deploy(
      BASE_FEE,
      GAS_PRICE,
      WEI_PER_UNIT_LINK
    );

    const mockVRFCoordinatorAddress = await mockVRFCoordinator.getAddress();

    // Déployer le contrat de test NadCasino en utilisant l'adresse du MockVRFCoordinator
    const NadCasino = await ethers.getContractFactory("NadCasino");
    const casino = await NadCasino.deploy(mockVRFCoordinatorAddress);

    // Attacher le token
    const tokenAddress = await casino.tokenAddress();
    const NadCasinoToken = await ethers.getContractFactory("NadCasinoToken");
    const token = NadCasinoToken.attach(tokenAddress);

    return {
      casino,
      token,
      owner,
      user1,
      mockVRFCoordinator,
      mockVRFCoordinatorAddress,
    };
  }

  async function deployVRFCoordinatorAndCasinoFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    const BASE_FEE = "1000000000000000"; // 0.001 ether as base fee
    const GAS_PRICE = "50000000000"; // 50 gwei
    const WEI_PER_UNIT_LINK = "10000000000000000"; // 0.01 ether per LINK

    // Deploy the MockVRFCoordinator
    const MockVRFCoordinator = await ethers.getContractFactory(
      "VRFCoordinatorV2_5Mock"
    );
    const mockVRFCoordinator = await MockVRFCoordinator.deploy(
      BASE_FEE,
      GAS_PRICE,
      WEI_PER_UNIT_LINK
    );

    const mockVRFCoordinatorAddress = await mockVRFCoordinator.getAddress();

    // Deploy the NadCasino contract using the MockVRFCoordinator address
    const Casino = await ethers.getContractFactory("NadCasino");
    const casino = await Casino.deploy(mockVRFCoordinatorAddress);

    // Attach the token
    const tokenAddress = await casino.tokenAddress();
    const Token = await ethers.getContractFactory("NadCasinoToken");
    const token = Token.attach(tokenAddress);

    // Buy tokens for the user
    await casino
      .connect(user1)
      .buyTokens(30000, { value: ethers.parseEther("1") });

    return {
      casino,
      token,
      owner,
      user1,
      user2,
      mockVRFCoordinator,
      mockVRFCoordinatorAddress,
    };
  }

  describe("NadCasino contract deployment testing", function () {
    it("Should return the correct decimals", async function () {
      const { token } = await loadFixture(deployVRFCoordinatorAndCasinoFixture);
      expect(await token.decimals()).to.equal(0);
    });

    it("Should set the right owner", async function () {
      const { casino, owner } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );
      expect(await casino.owner()).to.equal(owner.address);
    });

    it("Should not set another owner", async function () {
      const { casino, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );
      expect(await casino.owner()).to.not.equal(user1.address);
    });

    it("Should have initial token supply minted", async function () {
      const { token } = await loadFixture(deployVRFCoordinatorAndCasinoFixture);
      expect(await token.totalSupply()).to.equal(1000000);
    });

    it("Should have initial token balance", async function () {
      const { token, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );
      expect(await token.balanceOf(user1.address)).to.equal(30000);
    });

    it("Should have TOKEN_PRICE set correctly", async function () {
      const { casino } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );
      expect(await casino.TOKEN_PRICE()).to.equal(TOKEN_PRICE);
    });

    it("Player totalGains should be 0 at deployment", async function () {
      const { casino, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );
      const player = await casino.players(user1.address);
      expect(player.totalGains).to.equal(0);
    });

    it("Player biggestWin should be 0 at deployment", async function () {
      const { casino, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );
      const player = await casino.players(user1.address);
      expect(player.biggestWin).to.equal(0);
    });

    it("Player nbGames should be 0 at deployment", async function () {
      const { casino, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );
      const player = await casino.players(user1.address);
      expect(player.nbGames).to.equal(0);
    });

    it("Player nbGamesWins should be 0 at deployment", async function () {
      const { casino, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );
      const player = await casino.players(user1.address);
      expect(player.nbGamesWins).to.equal(0);
    });

    it("Should have biggestSingleWinEver set to 0", async function () {
      const { casino } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );
      expect(await casino.biggestSingleWinEver()).to.equal(0);
    });

    it("Should have biggestTotalWinEver set to 0", async function () {
      const { casino } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );
      expect(await casino.biggestTotalWinEver()).to.equal(0);
    });
  });

  describe("Buying tokens function", function () {
    it("Should allow buying tokens with sufficient ETH", async function () {
      const { casino, token, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixtureBeforeTheBought
      );
      const etherGiven = ethers.parseEther("1");
      await casino.connect(user1).buyTokens(30000, { value: etherGiven });
      expect(await token.balanceOf(user1.address)).to.equal(30000);
    });

    it("Should revert if the amount is less than the price of 10 tokens", async function () {
      const { casino, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );
      const etherGiven = ethers.parseEther("0.00003");
      await expect(
        casino.connect(user1).buyTokens(10, { value: etherGiven })
      ).to.be.revertedWith(
        "You can't send less than 0.0003 ETH, you can not buy less than 10 tokens"
      );
    });

    it("Should revert if less than 10 tokens are bought", async function () {
      const { casino, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );
      const etherGiven = ethers.parseEther("1");
      await expect(
        casino.connect(user1).buyTokens(5, { value: etherGiven })
      ).to.be.revertedWith("You can not buy less than 10 tokens");
    });

    it("Should revert if ETH sent are not enough for this quantity of tokens", async function () {
      const { casino, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );
      const etherGiven = ethers.parseEther("1");
      await expect(
        casino.connect(user1).buyTokens(50000, { value: etherGiven })
      ).to.be.revertedWith("You need more eth for this quantity of tokens");
    });

    it("Should revert if not enough tokens are available for purchase", async function () {
      const { casino, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );
      const etherGiven = ethers.parseEther("100");
      await expect(
        casino.connect(user1).buyTokens(3000000, { value: etherGiven })
      ).to.be.revertedWith("Not enough tokens available for purchase");
    });

    it("Should revert if the supply after the purchase is greater than 5%", async function () {
      const { casino, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );
      const etherGiven = ethers.parseEther("2");
      await expect(
        casino.connect(user1).buyTokens(60000, { value: etherGiven })
      ).to.be.revertedWith("You cannot own more than 5% of the total supply");
    });
  });

  describe("Returning tokens", function () {
    it("Should return tokens if allowance is sufficient", async function () {
      const { casino, token, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );
      await token.connect(user1).approve(casino, 10);
      await expect(casino.connect(user1).devolverTokens(10))
        .to.emit(casino, "PlayerWithdrewTokens")
        .withArgs(user1.address, 10);
      expect(await token.balanceOf(user1.address)).to.equal(29990);
    });

    it("Should revert if returning more tokens than owned", async function () {
      const { casino, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );
      await expect(
        casino.connect(user1).devolverTokens(40000)
      ).to.be.revertedWith("Insufficient token balance");
    });

    it("Should revert if returning zero tokens", async function () {
      const { casino, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );
      await expect(casino.connect(user1).devolverTokens(0)).to.be.revertedWith(
        "You need to return a number of tokens greater than 0"
      );
    });

    it("Should revert if the contract does not have enough ETH balance to pay for returned tokens", async function () {
      const { casino, owner, token, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );
      await expect(casino.connect(owner).withdrawEth(1)).to.changeEtherBalance(
        owner,
        ethers.parseEther("1.0")
      );

      // Ensure the contract does not have sufficient ETH balance
      await token.connect(user1).approve(casino, 10);

      // Try to return the tokens
      await expect(casino.connect(user1).devolverTokens(10)).to.be.revertedWith(
        "Insufficient ETH balance in contract to pay for returned tokens"
      );
    });

    it("Should emit PlayerBecameInactive if player returns all tokens", async function () {
      const { casino, token, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );
      await token.connect(user1).approve(casino, 30000);
      await expect(casino.connect(user1).devolverTokens(30000))
        .to.emit(casino, "PlayerBecameInactive")
        .withArgs(user1.address);
      expect(await token.balanceOf(user1.address)).to.equal(0);
    });

    it("Should revert if allowance is not set", async function () {
      const { casino, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );
      await expect(casino.connect(user1).devolverTokens(10)).to.be.revertedWith(
        "Allowance not set or insufficient"
      );
    });

    it("Should revert if allowance is less than the number of tokens to be returned", async function () {
      const { casino, token, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
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
        deployVRFCoordinatorAndCasinoFixture
      );
      await expect(casino.connect(user1).playGame(1, 10)).to.be.revertedWith(
        "Allowance not set or insufficient"
      );
    });

    it("Should revert if allowance is less than the bet amount", async function () {
      const { casino, token, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );
      await token.connect(user1).approve(casino, 5);
      await expect(casino.connect(user1).playGame(1, 10)).to.be.revertedWith(
        "Allowance not set or insufficient"
      );
    });

    it("Should revert if bet amount is zero", async function () {
      const { casino, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );
      await expect(casino.connect(user1).playGame(1, 0)).to.be.revertedWith(
        "Bet amount must be greater than zero"
      );
    });

    it("Should revert if bet amount is more than player's balance", async function () {
      const { casino, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );
      await expect(casino.connect(user1).playGame(1, 40000)).to.be.revertedWith(
        "Insufficient tokens balance"
      );
    });

    it("Should revert if game type is invalid", async function () {
      const { casino, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );
      await expect(casino.connect(user1).playGame(3, 3)).to.be.revertedWith(
        "Invalid game type"
      );
    });

    it("Should revert if bet amount for game type 2 is not a multiple of 3", async function () {
      const { casino, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );
      await expect(casino.connect(user1).playGame(2, 4)).to.be.revertedWith(
        "Bet amount for gameType 2 must be a multiple of 3 tokens"
      );
    });
  });

  describe("Solvency check", function () {
    it("Should revert if contract cannot pay potential win in tokens", async function () {
      const { casino, user1, token } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );
      await token.connect(user1).approve(casino, 30000);
      await expect(casino.connect(user1).playGame(2, 30000)).to.be.revertedWith(
        "Contract cannot pay potential win in tokens"
      );
    });

    it("Should revert if contract cannot pay potential win in Ether", async function () {
      const { casino, user1, token } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
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
        deployVRFCoordinatorAndCasinoFixture
      );
      await expect(casino.connect(owner).withdrawEth(1)).to.changeEtherBalance(
        owner,
        ethers.parseEther("1.0")
      );
    });

    it("Should revert when non-authorized user tries to withdraw ETH", async function () {
      const { casino, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );
      await expect(casino.connect(user1).withdrawEth(1)).to.be.reverted;
    });

    it("Should revert if not enough ETH in reserve", async function () {
      const { casino } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixtureBeforeTheBought
      );
      await expect(casino.withdrawEth(1)).to.be.revertedWith(
        "Not enough ETH in reserve"
      );
    });
  });

  describe("Mint function", function () {
    it("Should revert when a non-authorized user tries to mint", async function () {
      const { token, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );
      await expect(token.connect(user1).mint(user1.address, 10000000)).to.be
        .reverted;
    });
  });

  describe("Receive function", function () {
    it("Should revert when Ether is sent directly to the contract", async function () {
      const { casino, owner } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );

      await expect(
        owner.sendTransaction({
          to: casino.getAddress(),
          value: ethers.parseEther("1.0"),
        })
      ).to.be.revertedWith("Contract does not accept plain Ether transfers");
    });
  });
});
