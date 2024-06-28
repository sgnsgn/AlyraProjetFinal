const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
// const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Casino contract testing", function () {
  let casino;
  let owner, user1, user2, user3;
  async function deployCasinoFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, user1, user2, user3] = await ethers.getSigners();
    const Casino = await ethers.getContractFactory("Casino");
    casino = await Casino.deploy();
    return { casino, owner, user1, user2, user3 };
  }

  beforeEach(async () => {
    const fixture = await loadFixture(deployCasinoFixture);
    casino = fixture.casino;
    owner = fixture.owner;
    user1 = fixture.user1;
    user2 = fixture.user2;
    user3 = fixture.user3;
  });

  describe("Voting contract deployment testing", function () {
    it("Should set the right owner", async function () {
      expect(await casino.owner()).to.equal(owner.address);
    });

    it("Should not set another owner", async function () {
      expect(await casino.owner()).to.not.equal(user1.address);
    });
  });
});
