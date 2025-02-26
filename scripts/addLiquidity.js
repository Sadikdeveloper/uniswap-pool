const { ethers } = require("ethers");
require("dotenv").config();

const POSITION_MANAGER = process.env.POSITION_MANAGER;
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
const WETH = process.env.WETH;
const POOL_ADDRESS = process.env.POOL_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;

const NPM_ABI = [
	"function mint((address token0,address token1,uint24 fee,int24 tickLower,int24 tickUpper,uint256 amount0Desired,uint256 amount1Desired,uint256 amount0Min,uint256 amount1Min,address recipient,uint256 deadline)) external payable returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
];

const ERC20_ABI = [
	"function approve(address spender, uint256 amount) external returns (bool)",
	"function allowance(address owner, address spender) external view returns (uint256)",
	"function balanceOf(address account) external view returns (uint256)",
	"function decimals() external view returns (uint8)",
	"function symbol() external view returns (string)",
];

const POOL_ABI = [
	"function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
	"function liquidity() external view returns (uint128)",
];

async function main() {
	const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
	const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

	try {
		console.log("==== Starting Liquidity Addition Process ====");
		console.log("Wallet Address:", wallet.address);

		// Setup contracts
		const token = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, wallet);
		const positionManager = new ethers.Contract(
			POSITION_MANAGER,
			NPM_ABI,
			wallet
		);
		const pool = new ethers.Contract(POOL_ADDRESS, POOL_ABI, wallet);

		// Get initial token details
		const symbol = await token.symbol();
		const decimals = await token.decimals();
		const tokenBalance = await token.balanceOf(wallet.address);

		console.log("\n==== Token Details ====");
		console.log("Symbol:", symbol);
		console.log("Decimals:", decimals);
		console.log("Balance:", ethers.utils.formatEther(tokenBalance));

		// Check ETH balance
		const ethBalance = await provider.getBalance(wallet.address);
		console.log("\n==== ETH Balance ====");
		console.log("ETH Balance:", ethers.utils.formatEther(ethBalance));

		// Check pool status
		const slot0 = await pool.slot0();
		const liquidity = await pool.liquidity();
		console.log("\n==== Pool Status ====");
		console.log("Current tick:", slot0.tick.toString());
		console.log("Pool unlocked:", slot0.unlocked);
		console.log("Current liquidity:", liquidity.toString());

		// Sort tokens
		const token0Address =
			TOKEN_ADDRESS.toLowerCase() < WETH.toLowerCase() ? TOKEN_ADDRESS : WETH;
		const token1Address =
			TOKEN_ADDRESS.toLowerCase() < WETH.toLowerCase() ? WETH : TOKEN_ADDRESS;

		// Check initial allowance
		const currentAllowance = await token.allowance(
			wallet.address,
			POSITION_MANAGER
		);
		console.log("\n==== Initial Approval Status ====");
		console.log(
			"Current allowance:",
			ethers.utils.formatEther(currentAllowance)
		);

		// Reset approval if needed
		console.log("\nResetting approval...");
		const resetTx = await token.approve(POSITION_MANAGER, 0);
		await resetTx.wait();
		console.log("Approval reset to 0");

		// Set new approval
		console.log("\nSetting new approval...");
		const approveAmount = ethers.utils.parseEther("2.0");
		const approveTx = await token.approve(POSITION_MANAGER, approveAmount);
		await approveTx.wait();

		// Verify new allowance
		const newAllowance = await token.allowance(
			wallet.address,
			POSITION_MANAGER
		);
		console.log("New allowance:", ethers.utils.formatEther(newAllowance));

		// Set test amount and create parameters
		const testAmount = ethers.utils.parseEther("0.0001");
		console.log("\n==== Transaction Amount ====");
		console.log("Test amount:", ethers.utils.formatEther(testAmount), "tokens");

		const params = {
			token0: token0Address,
			token1: token1Address,
			fee: 3000,
			tickLower: -60,
			tickUpper: 60,
			amount0Desired: testAmount,
			amount1Desired: testAmount,
			amount0Min: 0,
			amount1Min: 0,
			recipient: wallet.address,
			deadline: Math.floor(Date.now() / 1000) + 3600,
		};

		console.log("\n==== Transaction Parameters ====");
		console.log(JSON.stringify(params, null, 2));

		// Simulate transaction
		console.log("\nSimulating transaction...");
		try {
			await positionManager.callStatic.mint(params, {
				value: token0Address === WETH ? testAmount : testAmount,
			});
			console.log("Simulation successful");
		} catch (error) {
			console.log("\nSimulation failed:", error.message);
			if (error.message.includes("STF")) {
				console.log("\nSTF Error Diagnostics:");
				console.log(
					"1. Token Balance:",
					ethers.utils.formatEther(tokenBalance)
				);
				console.log("2. Amount Needed:", ethers.utils.formatEther(testAmount));
				console.log(
					"3. Initial Allowance:",
					ethers.utils.formatEther(currentAllowance)
				);
				console.log(
					"4. Final Allowance:",
					ethers.utils.formatEther(newAllowance)
				);
				console.log("5. Token0:", token0Address);
				console.log("6. Token1:", token1Address);
			}
			throw error;
		}

		// Execute transaction
		console.log("\nExecuting transaction...");
		const tx = await positionManager.mint(params, {
			gasLimit: 500000,
			value: token0Address === WETH ? testAmount : testAmount,
		});

		console.log("Transaction sent! Hash:", tx.hash);
		const receipt = await tx.wait();

		if (receipt.status === 1) {
			console.log("\n==== Success ====");
			console.log("Liquidity added successfully!");

			// Get final balances
			const finalTokenBalance = await token.balanceOf(wallet.address);
			const finalEthBalance = await provider.getBalance(wallet.address);

			console.log("\n==== Final Balances ====");
			console.log(
				"Final Token Balance:",
				ethers.utils.formatEther(finalTokenBalance)
			);
			console.log(
				"Final ETH Balance:",
				ethers.utils.formatEther(finalEthBalance)
			);
		}
	} catch (error) {
		console.log("\n==== Error Occurred ====");
		console.error("Main Error:", error.message);

		if (error.message.includes("STF")) {
			console.log("\nPossible STF causes:");
			console.log("1. Token approval issue - check allowance");
			console.log("2. Token has transfer restrictions");
			console.log("3. Insufficient balance");
			console.log("4. Token requires additional setup");

			if (error.error && error.error.message) {
				console.log("\nDetailed error:", error.error.message);
			}
		}

		// Get final balance
		const finalEthBalance = await provider.getBalance(wallet.address);
		console.log("\n==== Final Balance ====");
		console.log(
			"Final ETH Balance:",
			ethers.utils.formatEther(finalEthBalance)
		);
	}
}

main();
