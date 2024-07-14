# Final Project - NADCASINO

This repository contains the source code for my final project at [Alyra](https://formation.alyra.fr/login).  
This project includes a backend with smart contracts and a frontend that interacts with these contracts deployed on the Sepolia blockchain.
My deployed DApp is available here : https://deploy-casino-final-project-alyra.vercel.app/

## Table of Contents

- [Context](#context)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Context

As part of my training at Alyra, I developed a decentralized casino using smart contracts deployed on the Sepolia blockchain. This project aims to demonstrate the skills acquired in smart contract development, blockchain integration, and frontend development.

## Features

- **Buy Tokens**: Users can buy tokens to play casino games.
- **Casino Games**: Two types of games are available with different probabilities and win multipliers.
- **Real-time Events**: Users can see real-time game events such as wins and losses.
- **Withdraw Tokens**: Users can return tokens and retrieve their equivalent in ether.

## Technologies Used

- **Solidity**: For smart contract development.
- **React**: For frontend development.
- **Wagmi**: For blockchain integration in the frontend.
- **Chainlink VRF**: For secure random number generation on the blockchain.
- **Hardhat**: For smart contract development, testing, and deployment.
- **Ethers.js**: For interacting with the Ethereum blockchain in the frontend.
- **Viem**: Used for enhanced Ethereum-related functionalities.
- **Sepolia Testnet**: For smart contract deployment.

## Installation

### Prerequisites

- Node.js (>= v14)
- NPM or Yarn
- An Ethereum wallet like MetaMask

### Clone the repository

```bash
git clone https://github.com/sgnsgn/AlyraProjetFinal.git
cd AlyraProjetFinal
```

### Backend

**Install dependencies:**

```bash
cd backend
npm install
```

**Configure environment variables:**

- Create a .env file in the backend directory and add the necessary information (API key, node URL, etc.)
- Do not forget to install dotenv before any push online
```bash
npm install dotenv
```

**Compile and deploy smart contracts:**

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

### Frontend

**Install dependencies:**

```bash
cd frontend
npm install
```

**Configure environment variables:**

- Create a .env.local file in the frontend directory and add the addresses of the deployed contracts and other necessary configurations.

**Start the development server:**

```bash
npm run dev
```

## Usage

**_Access the application:_**

- Open your browser and go to http://localhost:3000.

**_Connect with MetaMask (or another wallet : Rabby, Rainbow,...):_**

- Connect your MetaMask wallet to the application.

**_Buy Tokens:_**

- Use the interface to buy tokens using ether.

**_Play Casino Games:_**

- Choose a game, set your bet, and play the game. Results will be displayed in real-time.

**_View Events:_**
Check the events section to see real-time transactions and game results.

## Contributing

Contributions are welcome! To contribute, please follow these steps:

- Fork the repository
- Create a feature branch (git checkout -b feature/new-feature)
- Commit your changes (git commit -m 'Add a new feature')
- Push to the branch (git push origin feature/new-feature)
- Open a Pull Request

## License

This project is licensed under the MIT License. See the [LICENSE](https://en.wikipedia.org/wiki/MIT_License) file for details.
