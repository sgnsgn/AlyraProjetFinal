const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Casino contract testing", function () {
  const TOKEN_PRICE = ethers.parseEther("0.00003");

  async function deployCasinoFixture() {
    const [owner, user1] = await ethers.getSigners();

    // Déployer le MockVRFCoordinator
    const MockVRFCoordinator = await ethers.getContractFactory(
      "VRFCoordinatorV2MyMock"
    );
    const mockVRFCoordinator = await MockVRFCoordinator.deploy();

    const mockVRFCoordinatorAddress = await mockVRFCoordinator.getAddress();

    // Déployer le contrat Casino en utilisant l'adresse du MockVRFCoordinator
    const Casino = await ethers.getContractFactory("Casino");
    const casino = await Casino.deploy(mockVRFCoordinatorAddress);

    // Attacher le token
    const tokenAddress = await casino.tokenAddress();
    const CasinoToken = await ethers.getContractFactory("CasinoToken");
    const token = CasinoToken.attach(tokenAddress);

    // Acheter des jetons pour l'utilisateur
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

  describe("Playing games", function () {
    it("Should emit RandomWordsRequested event", async function () {
      const { casino, token, user1 } = await loadFixture(deployCasinoFixture);
      await token.connect(user1).approve(casino, 10);

      await expect(casino.connect(user1).playGame(1, 10)).to.emit(
        casino,
        "RandomWordsRequested"
      );
    });

    it("Should handle VRF response correctly", async function () {
      const { casino, token, user1, mockVRFCoordinator } = await loadFixture(
        deployCasinoFixture
      );
      await token.connect(user1).approve(casino, 10);

      // Jouer le jeu et obtenir le requestId
      const playGameTx = await casino.connect(user1).playGame(1, 10);
      const receipt = await playGameTx.wait();
      const requestId = receipt.events.find(
        (event) => event.event === "RandomWordsRequested"
      ).args.requestId;

      // Simuler la réponse VRF
      const randomWords = [12345];
      await mockVRFCoordinator.fulfillRandomWords(
        requestId,
        casino.address,
        randomWords
      );

      // Vérifier que le jeu a été traité correctement
      const player = await casino.players(user1.address);
      expect(player.nbGames).to.equal(1);
      // Ajoutez d'autres vérifications selon vos besoins
    });

    it("Should store requestId and player data correctly", async function () {
      const { casino, token, user1, mockVRFCoordinator } = await loadFixture(
        deployCasinoFixture
      );
      await token.connect(user1).approve(casino, 10);

      // Jouer le jeu et obtenir le requestId
      const playGameTx = await casino.connect(user1).playGame(1, 10);
      const receipt = await playGameTx.wait();
      const requestId = receipt.events.find((event) => event.event === "").args
        .requestId;

      // Vérifier que les données sont correctement stockées
      expect(await casino.requestIdToPlayer(requestId)).to.equal(user1.address);
      expect(await casino.playerBetAmount(user1.address)).to.equal(10);
      expect(await casino.playerGameType(user1.address)).to.equal(1);
    });
  });
});
