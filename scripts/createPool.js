const { ethers } = require("ethers");
require('dotenv').config({ path: process.env.ENV_FILE || '.env' });

const UNISWAP_FACTORY = process.env.UNISWAP_FACTORY;
const WETH = process.env.WETH;
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
const POSITION_MANAGER = process.env.POSITION_MANAGER;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;

const FACTORY_ABI = [
	"function createPool(address tokenA, address tokenB, uint24 fee) external returns (address pool)",
	"function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)",
];

async function main() {
	const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
	const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

	try {
		console.log("Connecting to Uniswap Factory...");
		const factory = new ethers.Contract(UNISWAP_FACTORY, FACTORY_ABI, wallet);

		// Check if pool exists
		console.log("Checking if pool exists...");
		const existingPool = await factory.getPool(TOKEN_ADDRESS, WETH, 3000);

		if (existingPool !== ethers.constants.AddressZero) {
			console.log("Pool already exists at:", existingPool);
			return;
		}

		console.log("Creating new pool...");
		const tx = await factory.createPool(TOKEN_ADDRESS, WETH, 3000);
		console.log("Transaction sent! Hash:", tx.hash);

		console.log("Waiting for confirmation...");
		const receipt = await tx.wait();
		console.log("Pool creation confirmed in block:", receipt.blockNumber);

		// Get new pool address
		const poolAddress = await factory.getPool(TOKEN_ADDRESS, WETH, 3000);
		console.log("\nNew pool created at:", poolAddress);
	} catch (error) {
		if (error.reason) {
			console.error("Error:", error.reason);
		} else {
			console.error("Error:", error.message || error);
		}
		if (error.error && error.error.message) {
			console.error("Additional error details:", error.error.message);
		}
	}
}

main();
