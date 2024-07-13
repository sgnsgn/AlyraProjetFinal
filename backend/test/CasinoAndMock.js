const { network } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { networkConfig } = require("../helper-hardhat-config");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Casino Results playGame testing with the Contract Mock", function () {
  async function deployVRFCoordinatorAndCasinoFixture() {
    const [owner, user1] = await ethers.getSigners();

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

    // Deploy the CasinoTest contract using the MockVRFCoordinator address
    const CasinoTest = await ethers.getContractFactory("CasinoTest");
    const casino = await CasinoTest.deploy(mockVRFCoordinatorAddress);

    // Attach the token
    const tokenAddress = await casino.tokenAddress();
    const CasinoToken = await ethers.getContractFactory("NadCasinoToken");
    const token = CasinoToken.attach(tokenAddress);

    // Buy tokens for the user
    await casino
      .connect(user1)
      .buyTokens(30000, { value: ethers.parseEther("1") });

    return {
      casino,
      token,
      owner,
      user1,
      mockVRFCoordinator,
      mockVRFCoordinatorAddress,
    };
  }

  describe("VRFCoordinatorV2_5Mock Fixture testing", function () {
    it("Should deploy VRFCoordinatorV2_5Mock with correct initial setup", async function () {
      const { mockVRFCoordinator, mockVRFCoordinatorAddress, owner } =
        await loadFixture(deployVRFCoordinatorAndCasinoFixture);

      // Check that the MockVRFCoordinator address is correct
      expect(mockVRFCoordinatorAddress).to.properAddress;

      // Check that the owner is correctly set
      expect(await mockVRFCoordinator.owner()).to.equal(owner.address);

      // Check the initial parameters
      expect(await mockVRFCoordinator.i_base_fee()).to.equal(
        ethers.parseEther("0.001")
      );
      expect(await mockVRFCoordinator.i_gas_price()).to.equal(5e10);
      expect(await mockVRFCoordinator.i_wei_per_unit_link()).to.equal(
        10000000000000000n
      );
    });
  });

  describe("Testing variables after the FulfillRandomWords's answer for the game 1", function () {
    it("Should update the variables nbGames, nbGamesWins, totalGains after the answer of VRF if the game is won", async function () {
      const { casino, token, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );

      await token.connect(user1).approve(casino, 10);

      // Use a hardcoded requestId
      const hardcodedRequestId = 1;

      // Simulate the PlayGame function, directly initialize the mappings via the test contract
      await casino.testSetRequestIdToPlayer(hardcodedRequestId, user1.address);
      await casino.testSetPlayerBetAmount(user1.address, 10);
      await casino.testSetPlayerGameType(user1.address, 1);

      // Define hardcoded values for randomWords
      const randomWords = [0]; // Simulate a winning result

      // Call fulfillRandomWords directly via the test contract
      await casino.testFulfillRandomWords(hardcodedRequestId, randomWords);

      // Check that the game was processed correctly
      const player = await casino.players(user1.address);
      expect(player.nbGames).to.equal(1);
      expect(player.nbGamesWins).to.equal(1);
      expect(player.totalGains).to.be.above(0);
    });

    it("Should update the variables nbGames, nbGamesWins, totalGains after the answer of VRF if the game is lost", async function () {
      const { casino, token, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );

      await token.connect(user1).approve(casino, 10);

      // Use a hardcoded requestId
      const hardcodedRequestId = 1;

      // Simulate the PlayGame function, directly initialize the mappings via the test contract
      await casino.testSetRequestIdToPlayer(hardcodedRequestId, user1.address);
      await casino.testSetPlayerBetAmount(user1.address, 10);
      await casino.testSetPlayerGameType(user1.address, 1);

      // Define hardcoded values for randomWords
      const randomWords = [1]; // Simulate a losing result

      // Call fulfillRandomWords directly via the test contract
      await casino.testFulfillRandomWords(hardcodedRequestId, randomWords);

      // Check that the game was processed correctly
      const player = await casino.players(user1.address);
      expect(player.nbGames).to.equal(1);
      expect(player.nbGamesWins).to.equal(0);
      expect(player.totalGains).to.be.equal(0);
    });

    it("Should emit the event PlayerLost after the answer of VRF if the game is Lost", async function () {
      const { casino, token, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );

      await token.connect(user1).approve(casino, 10);

      // Use a hardcoded requestId
      const hardcodedRequestId = 1;

      // Initialize the mappings directly via the test contract
      await casino.testSetRequestIdToPlayer(hardcodedRequestId, user1.address);
      await casino.testSetPlayerBetAmount(user1.address, 10);
      await casino.testSetPlayerGameType(user1.address, 1);

      // Define hardcoded values for randomWords
      const randomWords = [1]; // Simulate a lost result

      // Call fulfillRandomWords directly via the test contract
      await casino.testFulfillRandomWords(hardcodedRequestId, randomWords);

      // Check that the PlayerLost event was emitted
      await expect(
        casino.testFulfillRandomWords(hardcodedRequestId, randomWords)
      )
        .to.emit(casino, "PlayerLost")
        .withArgs("0x0000000000000000000000000000000000000000", 0);
    });
  });

  describe("Testing variables after the FulfillRandomWords's answer for the game 2", function () {
    it("Should update the variables nbGames, nbGamesWins, totalGains after the answer of VRF if the game is won", async function () {
      const { casino, token, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );

      await token.connect(user1).approve(casino, 10);

      // Use a hardcoded requestId
      const hardcodedRequestId = 1;

      // Simulate the PlayGame function, directly initialize the mappings via the test contract
      await casino.testSetRequestIdToPlayer(hardcodedRequestId, user1.address);
      await casino.testSetPlayerBetAmount(user1.address, 10);
      await casino.testSetPlayerGameType(user1.address, 2);

      // Define hardcoded values for randomWords
      const randomWords = [0]; // Simulate a winning result

      // Call fulfillRandomWords directly via the test contract
      await casino.testFulfillRandomWords(hardcodedRequestId, randomWords);

      // Check that the game was processed correctly
      const player = await casino.players(user1.address);
      expect(player.nbGames).to.equal(1);
      expect(player.nbGamesWins).to.equal(1);
      expect(player.totalGains).to.be.above(0);
    });

    it("Should update the variables nbGames, nbGamesWins, totalGains after the answer of VRF if the game is lost", async function () {
      const { casino, token, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );

      await token.connect(user1).approve(casino, 10);

      // Use a hardcoded requestId
      const hardcodedRequestId = 1;

      // Simulate the PlayGame function, directly initialize the mappings via the test contract
      await casino.testSetRequestIdToPlayer(hardcodedRequestId, user1.address);
      await casino.testSetPlayerBetAmount(user1.address, 10);
      await casino.testSetPlayerGameType(user1.address, 2);

      // Define hardcoded values for randomWords
      const randomWords = [1]; // Simulate a losing result

      // Call fulfillRandomWords directly via the test contract
      await casino.testFulfillRandomWords(hardcodedRequestId, randomWords);

      // Check that the game was processed correctly
      const player = await casino.players(user1.address);
      expect(player.nbGames).to.equal(1);
      expect(player.nbGamesWins).to.equal(0);
      expect(player.totalGains).to.be.equal(0);
    });

    it("Should emit the event PlayerLost after the answer of VRF if the game is Lost", async function () {
      const { casino, token, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );

      await token.connect(user1).approve(casino, 10);

      // Use a hardcoded requestId
      const hardcodedRequestId = 1;

      // Initialize the mappings directly via the test contract
      await casino.testSetRequestIdToPlayer(hardcodedRequestId, user1.address);
      await casino.testSetPlayerBetAmount(user1.address, 10);
      await casino.testSetPlayerGameType(user1.address, 2);

      // Define hardcoded values for randomWords
      const randomWords = [1]; // Simulate a lost result

      // Call fulfillRandomWords directly via the test contract
      await casino.testFulfillRandomWords(hardcodedRequestId, randomWords);

      // Check that the PlayerLost event was emitted
      await expect(
        casino.testFulfillRandomWords(hardcodedRequestId, randomWords)
      )
        .to.emit(casino, "PlayerLost")
        .withArgs("0x0000000000000000000000000000000000000000", 0);
    });
  });
});
