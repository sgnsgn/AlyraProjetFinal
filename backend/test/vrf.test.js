const { network } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { assert, expect } = require("chai");
const { ethers } = require("hardhat");
const { isAddress } = require("web3-validator");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Casino contract testing", function () {
      const TOKEN_PRICE = ethers.parseEther("0.00003");

      async function deployCasinoFixture() {
        const [owner, user1] = await ethers.getSigners();

        // Déployer le MockVRFCoordinator
        const MockVRFCoordinator = await ethers.getContractFactory(
          "MockVRFCoordinator"
        );
        const mockVRFCoordinator = await MockVRFCoordinator.deploy();

        const mockVRFCoordinatorAddress = await mockVRFCoordinator.getAddress();

        // Déployer le contrat Casino en utilisant l'adresse du MockVRFCoordinator
        const Casino = await ethers.getContractFactory("Casino");
        const casino = await Casino.deploy(mockVRFCoordinatorAddress);

        const tokenAddress = await casino.tokenAddress();
        const CasinoToken = await ethers.getContractFactory("CasinoToken");
        const token = CasinoToken.attach(tokenAddress);

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
          expect(await casino.owner()).to.equal(owner.address);
        });
      });

      // Étape 2: Écrire un Test pour la Fonction playGame
      describe("Playing games", function () {
        it("Should play game if allowance is sufficient", async function () {
          const { casino, token, user1, mockVRFCoordinator } =
            await loadFixture(deployCasinoFixture);
          await token.connect(user1).approve(casino, 10);

          // Jouer le jeu et obtenir le requestId
          const playGameTx = await casino.connect(user1).playGame(1, 10);
          const receipt = await playGameTx.wait();
          console.log(
            `Transaction receipt: ${JSON.stringify(receipt, null, 2)}`
          );
          const requestId = receipt.events.find(
            (event) => event.event === "PlayerPlayedGame"
          ).args.requestId;

          // Simuler la réponse VRF
          const randomWords = [12345];
          await mockVRFCoordinator.fulfillRandomWords(
            requestId,
            casino.address,
            randomWords
          );

          await expect(playGameTx)
            .to.emit(casino, "PlayerPlayedGame")
            .withArgs(user1.address, 1, 10, 0);
        });
      });
    });
