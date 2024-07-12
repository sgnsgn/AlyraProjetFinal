const { network } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { assert, expect } = require("chai");
const { ethers } = require("hardhat");

describe("Casino contract testing", function () {
  const TOKEN_PRICE = ethers.parseEther("0.00003");

  async function deployVRFCoordinatorAndCasinoFixture() {
    const [owner, user1] = await ethers.getSigners();

    const BASE_FEE = "1000000000000000"; // 0.001 ether as base fee
    const GAS_PRICE = "50000000000"; // 50 gwei
    const WEI_PER_UNIT_LINK = "10000000000000000"; // 0.01 ether per LINK

    const chainId = network.config.chainId;

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

    // Déployer le contrat Casino en utilisant l'adresse du MockVRFCoordinator
    const Casino = await ethers.getContractFactory("Casino");
    const casino = await Casino.deploy(mockVRFCoordinatorAddress);

    // Attacher le token
    const tokenAddress = await casino.tokenAddress();
    const CasinoToken = await ethers.getContractFactory("CasinoToken");
    const token = CasinoToken.attach(tokenAddress);

    const fundAmount =
      networkConfig[chainId]["fundAmount"] || "1000000000000000000";

    // Créer un abonnement
    const transaction = await mockVRFCoordinator.createSubscription();
    const transactionReceipt = await transaction.wait(1);
    const subscriptionId = ethers.BigNumber.from(
      transactionReceipt.events[0].topics[1]
    );

    await mockVRFCoordinator.fundSubscription(subscriptionId, fundAmount);

    await mockVRFCoordinator.addConsumer(subscriptionId, casino.getAddress());

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

  describe("Fixture testing", function () {
    it("Should deploy VRFCoordinatorV2_5Mock with correct initial setup", async function () {
      const { mockVRFCoordinator, mockVRFCoordinatorAddress, owner } =
        await loadFixture(deployVRFCoordinatorAndCasinoFixture);

      // Vérifier que l'adresse du MockVRFCoordinator est correcte
      expect(mockVRFCoordinatorAddress).to.properAddress;

      // Vérifier que le propriétaire est bien défini
      expect(await mockVRFCoordinator.owner()).to.equal(owner.address);

      // Vérifier les paramètres initiaux
      expect(await mockVRFCoordinator.i_base_fee()).to.equal(
        ethers.parseEther("0.001")
      );
      expect(await mockVRFCoordinator.i_gas_price()).to.equal(5e10);
      expect(await mockVRFCoordinator.i_wei_per_unit_link()).to.equal(
        10000000000000000n
      );
    });
  });

  describe("Playing games", function () {
    it("Should emit RandomWordsRequested event", async function () {
      const { casino, token, user1 } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
      );
      await token.connect(user1).approve(casino, 10);

      await expect(casino.connect(user1).playGame(1, 10)).to.emit(
        casino,
        "RandomWordsRequested"
      );
    });

    it("Should handle VRF response correctly", async function () {
      const { casino, token, user1, mockVRFCoordinator } = await loadFixture(
        deployVRFCoordinatorAndCasinoFixture
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
        deployVRFCoordinatorAndCasinoFixture
      );
      await token.connect(user1).approve(casino, 10);

      // Jouer le jeu et obtenir le requestId
      const playGameTx = await casino.connect(user1).playGame(1, 10);
      const receipt = await playGameTx.wait();
      const requestId = receipt.events.find(
        (event) => event.event === "RandomWordsRequested"
      ).args.requestId;

      // Vérifier que les données sont correctement stockées
      expect(await casino.requestIdToPlayer(requestId)).to.equal(user1.address);
      expect(await casino.playerBetAmount(user1.address)).to.equal(10);
      expect(await casino.playerGameType(user1.address)).to.equal(1);
    });
  });
});
