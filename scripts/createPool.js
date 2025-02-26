const { ethers } = require("ethers");
require("dotenv").config({ path: process.env.ENV_FILE || ".env" });

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
		console.log("==== Pool Creation Process ====");
		console.log("Wallet Address:", wallet.address);

		// Check ETH balance
		const ethBalance = await provider.getBalance(wallet.address);
		console.log("ETH Balance:", ethers.utils.formatEther(ethBalance), "ETH");

		console.log("\nConnecting to Uniswap Factory...");
		const factory = new ethers.Contract(UNISWAP_FACTORY, FACTORY_ABI, wallet);

		// Check if pool exists
		console.log("Checking if pool exists...");
		const existingPool = await factory.getPool(TOKEN_ADDRESS, WETH, 3000);

		if (existingPool !== ethers.constants.AddressZero) {
			console.log("\n====== IMPORTANT ======");
			console.log("Pool already exists at:", existingPool);
			console.log(
				"\n⚠️ YOU MUST UPDATE YOUR .env.mainnet FILE WITH THIS ADDRESS:"
			);
			console.log("POOL_ADDRESS=" + existingPool);
			console.log("===============================");
			return;
		}

		console.log("Creating new pool...");
		const tx = await factory.createPool(TOKEN_ADDRESS, WETH, 3000, {
			maxFeePerGas: ethers.utils.parseUnits("0.1", "gwei"),
			maxPriorityFeePerGas: ethers.utils.parseUnits("0.05", "gwei"),
			gasLimit: 300000,
		});
        
		console.log("Transaction sent! Hash:", tx.hash);

		console.log("Waiting for confirmation...");
		const receipt = await tx.wait();
		console.log("Pool creation confirmed in block:", receipt.blockNumber);

		// Get new pool address
		const poolAddress = await factory.getPool(TOKEN_ADDRESS, WETH, 3000);
		console.log("\n====== IMPORTANT ======");
		console.log("New pool created at:", poolAddress);
		console.log(
			"\n⚠️ YOU MUST UPDATE YOUR .env.mainnet FILE WITH THIS ADDRESS:"
		);
		console.log("POOL_ADDRESS=" + poolAddress);
		console.log("===============================");

		// Final balance check
		const finalEthBalance = await provider.getBalance(wallet.address);
		console.log(
			"\nFinal ETH Balance:",
			ethers.utils.formatEther(finalEthBalance),
			"ETH"
		);
	} catch (error) {
		console.log("\n==== Error Occurred ====");
		console.error("Error:", error.message);

		// Log detailed error information
		if (error.reason) {
			console.error("Error reason:", error.reason);
		}
		if (error.error && error.error.message) {
			console.error("RPC error message:", error.error.message);
		}
		if (error.data) {
			console.error("Raw error data:", error.data);

			// Attempt to decode the revert reason using ethers
			try {
				const errorInterface = new ethers.utils.Interface([
					"error PoolAlreadyExists()",
					"error InvalidToken()",
					"error InvalidFee()",
					"error InsufficientFunds()",
					"error Unauthorized()",
					"error Error(string)", // Add this to catch generic string errors
				]);
				const decodedError = errorInterface.parseError(error.data);
				console.error("Decoded error:", decodedError.name, decodedError.args);
			} catch (decodeError) {
				console.error("Could not decode error data:", decodeError.message);
				// Try manual decoding of Error(string)
				if (error.data.startsWith("0x08c379a0")) {
					try {
						const stringOffset = parseInt(error.data.slice(10, 74), 16); // Get string length and offset
						const stringHex = error.data.slice(74); // Extract string data
						const decodedString = ethers.utils.toUtf8String("0x" + stringHex);
						console.error("Manually decoded error message:", decodedString);
					} catch (manualDecodeError) {
						console.error(
							"Could not manually decode error data:",
							manualDecodeError.message
						);
					}
				}
			}
		}
		throw error;
	}
}

main();
