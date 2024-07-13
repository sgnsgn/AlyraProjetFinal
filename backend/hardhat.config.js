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
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100,
          },
        },
      },
      {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100,
          },
        },
      },
    ],
  },
  networks: {
    sepolia: {
      url: RPC_URL_SEPOLIA,
      accounts: [`0x${PK}`],
      chainId: 11155111,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      allowUnlimitedContractSize: true,
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
