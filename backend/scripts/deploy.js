const hre = require("hardhat");

async function main() {
  const vrfCoordinatorAddress = "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B";

  const Casino = await ethers.getContractFactory("NadCasino");
  const casino = await Casino.deploy(vrfCoordinatorAddress);

  await casino.waitForDeployment();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
