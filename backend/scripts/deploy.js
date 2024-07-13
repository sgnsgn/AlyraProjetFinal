const hre = require("hardhat");

async function main() {
  // L'adresse du VRFCoordinator que vous souhaitez utiliser
  const vrfCoordinatorAddress = "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B";

  // Déployer le contrat Casino avec l'adresse du VRFCoordinator en argument
  const Casino = await ethers.getContractFactory("Casino");
  const casino = await Casino.deploy(vrfCoordinatorAddress);

  // Cette ligne attend que le déploiement du contrat soit terminé. Cela garantit que vous ne continuez pas tant que le contrat n'est pas déployé.
  await casino.waitForDeployment();
  // Une fois le contrat déployé, cette ligne imprime dans la console l'adresse du contrat déployé.
  console.log(`Casino deployed to ${casino.target}`);
}

// Vous appelez la fonction 'main' pour exécuter le déploiement du contrat.
// Si une erreur se produit, elle est capturée et affichée dans la console.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
