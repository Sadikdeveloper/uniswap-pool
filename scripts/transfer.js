const { ethers } = require("ethers");
require("dotenv").config();

const RPC_URL = process.env.RPC_URL;
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
const POOL_ADDRESS = process.env.POOL_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;


const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const tokenABI = [
	"function balanceOf(address account) public view returns (uint256)",
	"function allowance(address owner, address spender) public view returns (uint256)",
	"function symbol() public view returns (string)",
	"function decimals() public view returns (uint8)",
	"function transfer(address to, uint256 amount) public returns (bool)",
	"function approve(address spender, uint256 amount) public returns (bool)",
	"function transferFrom(address from, address to, uint256 amount) public returns (bool)",
	"error TransferInvalid()",
];

async function debugTransfer() {
	try {
		console.log("\n=== DEBUGGING TOKEN TRANSFER ===");
		console.log("Wallet address:", wallet.address);

		// Create contract instance
		const token = new ethers.Contract(TOKEN_ADDRESS, tokenABI, wallet);

		// Get basic token info
		const symbol = await token.symbol();
		const decimals = await token.decimals();
		const balance = await token.balanceOf(wallet.address);
		console.log(`Token: ${symbol}`);
		console.log(`Decimals: ${decimals}`);
		console.log(
			`Your balance: ${ethers.utils.formatUnits(balance, decimals)} ${symbol}`
		);

		// The amount to transfer (1 token)
		const amount = ethers.utils.parseUnits("1.0", decimals);

		console.log("\n=== ATTEMPTING DIRECT TRANSFER ===");
		console.log(
			`Transferring ${ethers.utils.formatUnits(
				amount,
				decimals
			)} ${symbol} to ${POOL_ADDRESS}`
		);

		// First try a direct transfer
		try {
			const transferTx = await token.transfer(POOL_ADDRESS, amount, {
				gasLimit: 2000000,
			});
			console.log("Transfer transaction hash:", transferTx.hash);
			await transferTx.wait();
			console.log("Transfer successful!");
		} catch (error) {
			console.error("Direct transfer failed!");

			// Try to decode the error data
			let decodedError = "Unknown error";
			if (error.data) {
				try {
					// Create interface for decoding errors
					const errorInterface = new ethers.utils.Interface([
						"error TransferInvalid()",
						"error TransferFailed()",
						"error InsufficientBalance()",
						"error Unauthorized()",
					]);

					decodedError = errorInterface.parseError(error.data);
					console.error("Decoded error:", decodedError.name);
				} catch (decodeError) {
					console.error("Could not decode error data");
				}
			}

			console.error("Error type:", error.code || "UNKNOWN");
			console.error("Error reason:", error.reason || "Unknown reason");

			if (error.error && error.error.message) {
				console.error("RPC error message:", error.error.message);
			}

			// If failed, let's try with approval + transferFrom
			console.log("\n=== ATTEMPTING APPROVAL + TRANSFERFROM ===");

			console.log("Checking current allowance...");
			const currentAllowance = await token.allowance(
				wallet.address,
				POOL_ADDRESS
			);
			console.log(
				`Current allowance: ${ethers.utils.formatUnits(
					currentAllowance,
					decimals
				)} ${symbol}`
			);

			if (currentAllowance.lt(amount)) {
				console.log("Approving tokens...");
				try {
					const approveTx = await token.approve(POOL_ADDRESS, amount, {
						gasLimit: 1000000,
					});
					console.log("Approval transaction hash:", approveTx.hash);
					await approveTx.wait();
					console.log("Approval successful!");

					// Verify new allowance
					const newAllowance = await token.allowance(
						wallet.address,
						POOL_ADDRESS
					);
					console.log(
						`New allowance: ${ethers.utils.formatUnits(
							newAllowance,
							decimals
						)} ${symbol}`
					);
				} catch (approveError) {
					console.error("Approval failed:", approveError.message);
					throw new Error("Could not approve tokens");
				}
			} else {
				console.log("Tokens already approved");
			}

			console.log("Attempting transferFrom...");
			try {
				const transferFromTx = await token.transferFrom(
					wallet.address,
					POOL_ADDRESS,
					amount,
					{
						gasLimit: 2000000,
					}
				);
				console.log("TransferFrom transaction hash:", transferFromTx.hash);
				await transferFromTx.wait();
				console.log("TransferFrom successful!");
			} catch (transferFromError) {
				console.error("TransferFrom failed!");
				console.error("Error type:", transferFromError.code || "UNKNOWN");
				console.error(
					"Error reason:",
					transferFromError.reason || "Unknown reason"
				);

				if (transferFromError.error && transferFromError.error.message) {
					console.error("RPC error message:", transferFromError.error.message);
				}

				// Time to dig deeper
				console.log("\n=== FINAL DIAGNOSTICS ===");
				console.log("Let's check if the token has transfer restrictions...");

				// Check token code to see if it's a proxy
				const code = await provider.getCode(TOKEN_ADDRESS);
				console.log(`Token contract code size: ${(code.length - 2) / 2} bytes`);
				console.log(
					`This ${
						(code.length - 2) / 2 > 100 ? "appears to be" : "might not be"
					} a standard ERC20 token`
				);

				console.log("\nPossible reasons for transfer failure:");
				console.log("1. The token contract may have transfer restrictions");
				console.log(
					"2. The pool address may not be allowed to receive tokens directly"
				);
				console.log(
					"3. The token may require a special method to transfer to contracts"
				);
				console.log("4. There might be a blacklist or whitelist mechanism");

				throw new Error("All transfer methods failed");
			}
		}

		// Final balance check
		const finalBalance = await token.balanceOf(wallet.address);
		const poolBalance = await token.balanceOf(POOL_ADDRESS);

		console.log("\n=== FINAL BALANCES ===");
		console.log(
			`Your balance: ${ethers.utils.formatUnits(
				finalBalance,
				decimals
			)} ${symbol}`
		);
		console.log(
			`Pool balance: ${ethers.utils.formatUnits(
				poolBalance,
				decimals
			)} ${symbol}`
		);
	} catch (error) {
		console.error("\n=== DEBUG FAILED ===");
		console.error("Final error:", error.message);
	}
}

// Run the debug function
debugTransfer();
