require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("hardhat-gas-reporter");
require("solidity-coverage");
// /!\
require("@nomicfoundation/hardhat-verify");
// /!\

const PK = process.env.PK || "";
const RPC_URL_SEPOLIA = process.env.RPC_URL_SEPOLIA || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: RPC_URL_SEPOLIA,
      accounts: [`0x${PK}`],
      chainId: 11155111,
    },
    hardhat: {
      forking: {
        url: "https://ethereum-sepolia.blockpi.network/v1/rpc/6142a3b1a140903e2583833c404cbb35ee099221",
        blockNumber: 6250000,
      },
    },
  },
  // Active le rapporteur de gaz (gas reporter) pour afficher les coûts de gaz
  // lors des déploiements et des transactions.
  gasReporter: {
    enabled: true,
  },
  // /!\  Permet de configurer la vérifications sur Etherscan
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  sourcify: {
    enabled: false, // ou false si vous voulez désactiver cette vérification
  },
};
