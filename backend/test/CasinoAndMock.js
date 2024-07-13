const { network } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { networkConfig } = require("../helper-hardhat-config");
const { expect } = require("chai");
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

    // const fundAmount =
    //   networkConfig[chainId]["fundAmount"] || "1000000000000000000";

    // // Create a subscription
    // const createSubscriptionTx = await mockVRFCoordinator.createSubscription();

    // console.log(`Transaction hash: ${createSubscriptionTx.hash}`);

    // // Wait for the transaction to be mined
    // const transactionReceipt = await createSubscriptionTx.wait();

    // console.log(
    //   "Transaction receipt:",
    //   JSON.stringify(transactionReceipt, null, 2)
    // );

    // let subscriptionId;

    // if (transactionReceipt.logs && transactionReceipt.logs.length > 0) {
    //   // The subscription ID should be in the second topic (index 1) of the first log
    //   subscriptionId = ethers.BigNumber.from(
    //     transactionReceipt.logs[0].topics[1]
    //   );
    //   console.log(`Extracted subscription ID from logs: ${subscriptionId}`);
    // } else {
    //   throw new Error("No logs found in transaction receipt");
    // }

    // // Now you can use this subscriptionId for funding and other operations
    // await mockVRFCoordinator.fundSubscription(subscriptionId, fundAmount);

    const mockVRFCoordinatorAddress = await mockVRFCoordinator.getAddress();

    // Déployer le contrat de test Casino en utilisant l'adresse du MockVRFCoordinator
    const CasinoTest = await ethers.getContractFactory("CasinoTest");
    const casino = await CasinoTest.deploy(mockVRFCoordinatorAddress);

    // Attacher le token
    const tokenAddress = await casino.tokenAddress();
    const CasinoToken = await ethers.getContractFactory("NadCasinoToken");
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

  it.skip("Should emit RandomWordsRequested event", async function () {
    const {} = await loadFixture(deployVRFCoordinatorAndCasinoFixture);
    await token.connect(user1).approve(nadCasino, 10);

    const tx = await nadCasino.connect(user1).playGame(1, 10);
    const receipt = await tx.wait();

    // Check if there's a log with the correct topic
    const randomWordsRequestedLog = receipt.logs.find(
      (log) =>
        log.topics[0] ===
        ethers.utils.id(
          "RandomWordsRequested(uint256,uint256,uint64,uint16,uint32,uint32,uint32,address)"
        )
    );

    expect(randomWordsRequestedLog).to.not.be.undefined;
  });

  it("Should handle VRF response correctly with hardcoded requestId", async function () {
    const { casino, token, user1, mockVRFCoordinator } = await loadFixture(
      deployVRFCoordinatorAndCasinoFixture
    );

    await token.connect(user1).approve(casino, 10);

    // Utiliser un requestId en dur
    const hardcodedRequestId = 1;

    // Initialiser les mappings directement via le contrat de test
    await casino.testSetRequestIdToPlayer(hardcodedRequestId, user1.address);
    await casino.testSetPlayerBetAmount(user1.address, 10);
    await casino.testSetPlayerGameType(user1.address, 1);

    // Définir des valeurs hardcodées pour randomWords
    const randomWords = [0]; // Simule un résultat gagnant

    // Appeler fulfillRandomWords directement via le contrat de test
    await casino.testFulfillRandomWords(hardcodedRequestId, randomWords);

    // Vérifier que le jeu a été traité correctement
    const player = await casino.players(user1.address);
    expect(player.nbGames).to.equal(1);
    expect(player.nbGamesWins).to.equal(1);
    expect(player.totalGains).to.be.above(0);

    // Vérifier que l'événement PlayerWon a été émis
    await expect(casino.testFulfillRandomWords(hardcodedRequestId, randomWords))
      .to.emit(casino, "PlayerWon")
      .withArgs(user1.address, 10, 100); // Ajuster les valeurs en fonction de votre logique
  });
});
