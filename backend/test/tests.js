const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
require("@nomicfoundation/hardhat-chai-matchers");
const { ethers } = require("hardhat");
const { isAddress } = require("web3-validator");

describe("Casino contract testing", function () {
  const TOKEN_PRICE = ethers.parseEther("0.00003");

  async function deployCasinoFixture() {
    const [owner, user1] = await ethers.getSigners();

    // Déployer le MockVRFCoordinator
    const MockVRFCoordinator = await ethers.getContractFactory(
      "MockVRFCoordinator"
    );
    const mockVRFCoordinator = await MockVRFCoordinator.deploy();

    // Déployer le contrat Casino (pas besoin de passer l'adresse du VRFCoordinator)
    const Casino = await ethers.getContractFactory("Casino");
    const casino = await Casino.deploy();

    const tokenAddress = await casino.tokenAddress();
    const CasinoToken = await ethers.getContractFactory("CasinoToken");
    const token = CasinoToken.attach(tokenAddress);

    return {
      casino,
      token,
      owner,
      user1,
      mockVRFCoordinator,
    };
  }

  async function deployCasinoAndBuyTokensFixture() {
    const { casino, token, owner, user1, mockVRFCoordinator } =
      await loadFixture(deployCasinoFixture);
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
      mockVRFCoordinator,
    };
  }

  describe("Fixture testing", function () {
    it("Should deploy Casino contract with correct initial setup", async function () {
      const {
        casino,
        token,
        owner,
        user1,
        mockVRFCoordinator,
        mockVRFCoordinatorAddress,
      } = await loadFixture(deployCasinoFixture);

      // Vérifier que l'adresse du MockVRFCoordinator est correcte
      expect(isAddress(mockVRFCoordinatorAddress)).to.be.true;

      // Vérifier que le propriétaire est bien défini
      expect(await casino.owner()).to.equal(await owner.getAddress());
    });

    it("Should deploy Casino contract and buy tokens correctly", async function () {
      const { casino, token, owner, user1, etherGiven, numberOfTokens } =
        await loadFixture(deployCasinoAndBuyTokensFixture);

      // Vérifier le solde des tokens de l'utilisateur
      expect(await token.balanceOf(user1.address)).to.equal(numberOfTokens);

      // Vérifier que l'ETH a bien été reçu par le contrat
      expect(await ethers.provider.getBalance(casino)).to.equal(etherGiven);
    });
  });

  it.only("Should play game if allowance is sufficient", async function () {
    const { casino, token, user1, mockVRFCoordinator } = await loadFixture(
      deployCasinoAndBuyTokensFixture
    );

    console.log("User1 Address:", user1.address);
    console.log("Casino Address:", await casino.getAddress());
    console.log(
      "MockVRFCoordinator Address:",
      await mockVRFCoordinator.getAddress()
    );

    await token.connect(user1).approve(casino, 10);
    console.log("User1 approved 10 tokens for Casino");

    // Jouer le jeu et obtenir le requestId
    const playGameTx = await casino.connect(user1).playGame(1, 10);
    console.log("User1 played game with 10 tokens");

    const receipt = await playGameTx.wait();
    console.log("Transaction receipt:", receipt);

    const playerPlayedGameEvent = receipt.events.find(
      (event) => event.event === "PlayerPlayedGame"
    );
    console.log("PlayerPlayedGame Event:", playerPlayedGameEvent);

    const requestId = playerPlayedGameEvent.args.requestId;
    console.log("Request ID:", requestId);

    // Simuler la réponse VRF
    const randomWords = [12345];
    await mockVRFCoordinator.fulfillRandomWords(
      requestId,
      await casino.getAddress(),
      randomWords
    );
    console.log("Fulfilled random words with request ID:", requestId);

    await expect(playGameTx)
      .to.emit(casino, "PlayerPlayedGame")
      .withArgs(user1.address, 1, 10, 0);
    console.log("Test finished successfully");
  });
});
