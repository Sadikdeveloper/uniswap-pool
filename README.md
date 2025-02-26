# Uniswap V3 Pool Interaction

This project demonstrates how to interact with Uniswap V3 on Arbitrum chains. It includes scripts for:

- Deploying an ERC20 token
- Creating a Uniswap V3 pool
- Initializing the pool
- Adding liquidity to the pool
- Transferring tokens

## Setup

1. Install dependencies:

```shell
yarn install
```

2. Create a `.env` file with the following variables:

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

## Deployment

Deploy your token to Arbitrum Sepolia:

```shell
npx hardhat run scripts/deploy.js --network arbitrumSepolia
```

Add the deployed token address to your `.env` file.

## Uniswap Pool Operations

Create a new Uniswap V3 pool:

```shell
node scripts/createPool.js
```

Initialize the pool:

```shell
node scripts/initPool.js
```

Add the created pool address to your `.env` file.

Add liquidity to the pool:

```shell
node scripts/addLiquidity.js
```

Transfer tokens:

```shell
node scripts/transfer.js
```

## For Mainnet Deployment

Create a new `.env.mainnet` file with the correct Arbitrum mainnet addresses:

```
# Arbitrum Mainnet
RPC_URL=https://arb1.arbitrum.io/rpc
PRIVATE_KEY=your_private_key_here

# Uniswap Contracts (Arbitrum Mainnet)
UNISWAP_FACTORY=0x1F98431c8aD98523631AE4a59f267346ea31F984
WETH=0x82aF49447D8a07e3bd95BD0d56f35241523fBab1
POSITION_MANAGER=0xC36442b4a4522E871399CD717aBDD847Ab11FE88

# Your contract addresses (will be populated after deployment)
TOKEN_ADDRESS=
POOL_ADDRESS=
```

Then run scripts with the mainnet environment:

```shell
ENV_FILE=.env.mainnet node scripts/deploy.js
```

## Hardhat Tasks

```shell
npx hardhat help
npx hardhat test
npx hardhat compile
npx hardhat node
```
