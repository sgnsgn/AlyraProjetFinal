const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
require("@nomicfoundation/hardhat-chai-matchers");

describe("Casino contract testing", function () {
  let casino;
  let token;
  let owner, user1, user2, user3;
  const TOKEN_PRICE = ethers.parseEther("0.00003");

  async function deployCasinoFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, user1, user2, user3] = await ethers.getSigners();
    const CasinoToken = await ethers.getContractFactory("CasinoToken");
    token = await CasinoToken.deploy("CasinoToken", "CTK");
    const Casino = await ethers.getContractFactory("Casino");
    casino = await Casino.deploy();
    return { casino, token, owner, user1, user2, user3 };
  }

  beforeEach(async () => {
    const fixture = await loadFixture(deployCasinoFixture);
    casino = fixture.casino;
    token = fixture.token;
    owner = fixture.owner;
    user1 = fixture.user1;
    user2 = fixture.user2;
    user3 = fixture.user3;
  });

  describe("Casino contract deployment testing", function () {
    it("Should set the right owner", async function () {
      expect(await casino.owner()).to.equal(owner.address);
    });

    it("Should not set another owner", async function () {
      expect(await casino.owner()).to.not.equal(user1.address);
    });

    it("Should have TOKEN_PRICE set correctly", async function () {
      expect(await casino.getTokenPrice()).to.equal(TOKEN_PRICE);
    });

    it("Player totalGains should be 0 at deployment", async function () {
      const player = await casino.players(user1.address);
      expect(player.totalGains).to.equal(0);
    });

    it("Player biggestWin should be 0 at deployment", async function () {
      const player = await casino.players(user1.address);
      expect(player.biggestWin).to.equal(0);
    });

    it("Player nbGames should be 0 at deployment", async function () {
      const player = await casino.players(user1.address);
      expect(player.nbGames).to.equal(0);
    });

    it("Player nbGamesWins should be 0 at deployment", async function () {
      const player = await casino.players(user1.address);
      expect(player.nbGamesWins).to.equal(0);
    });

    it("Should have biggestSingleWinEver set to 0", async function () {
      expect(await casino.biggestSingleWinEver()).to.equal(0);
    });

    it("Should have biggestTotalWinEver set to 0", async function () {
      expect(await casino.biggestTotalWinEver()).to.equal(0);
    });
  });
});
