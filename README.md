# Uniswap V3 Pool Interaction

This project demonstrates how to interact with Uniswap V3 on Arbitrum chains. It includes scripts for:

- Deploying an ERC20 token
- Creating a Uniswap V3 pool
- Initializing the pool
- Adding liquidity to the pool
- Transferring tokens

## Environment Setup

The project uses environment variables for configuration. Two environment files are used:

- `.env` - For Arbitrum Sepolia testnet (development)
- `.env.mainnet` - For Arbitrum Mainnet (production)

### Testnet Setup (`.env`)

```
# RPC URL
RPC_URL=https://sepolia-rollup.arbitrum.io/rpc

# Private key (keep this secure and never commit to git)
PRIVATE_KEY=your_private_key_here

# Uniswap Contracts (Arbitrum Sepolia)
UNISWAP_FACTORY=0x248AB79Bbb9bC29bB72f7Cd42F17e054Fc40188e
WETH=0x980B62Da83eFf3D4576C647993b0c1D7faf17c73
POSITION_MANAGER=0x6b2937Bde17889EDCf8fbD8dE31C3C2a70Bc4d65

# Your contract addresses (will be populated after deployment)
TOKEN_ADDRESS=
POOL_ADDRESS=
```

### Mainnet Setup (`.env.mainnet`)

```
# RPC URL
RPC_URL=https://arb1.arbitrum.io/rpc

# Private key (keep this secure and never commit to git)
PRIVATE_KEY=your_mainnet_private_key_here

# Uniswap Contracts (Arbitrum Mainnet)
UNISWAP_FACTORY=0x1F98431c8aD98523631AE4a59f267346ea31F984
WETH=0x82aF49447D8a07e3bd95BD0d56f35241523fBab1
POSITION_MANAGER=0xC36442b4a4522E871399CD717aBDD847Ab11FE88

# Your contract addresses (will be populated after deployment)
TOKEN_ADDRESS=
POOL_ADDRESS=
```

## Installation

```shell
yarn install
```

## Usage

### Testnet Operations

```shell
# Deploy token
yarn deploy:testnet

# Create pool
yarn create-pool:testnet

# Initialize pool
yarn init-pool:testnet

# Add liquidity
yarn add-liquidity:testnet

# Transfer tokens
yarn transfer:testnet
```

### Mainnet Operations

First, add the mainnet network to your hardhat.config.js:

```javascript
arbitrumMainnet: {
  url: process.env.RPC_URL,
  accounts: [process.env.PRIVATE_KEY]
}
```

Then run:

```shell
# Deploy token
yarn deploy:mainnet

# Create pool
yarn create-pool:mainnet

# Initialize pool
yarn init-pool:mainnet

# Add liquidity
yarn add-liquidity:mainnet

# Transfer tokens
yarn transfer:mainnet
```

Remember to update the TOKEN_ADDRESS and POOL_ADDRESS in your .env files after deployment and pool creation.

## Additional Commands

```shell
npx hardhat help
npx hardhat test
npx hardhat compile
```
