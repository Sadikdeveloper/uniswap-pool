const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
	const [deployer] = await ethers.getSigners();
	console.log("Deploying contracts with account:", deployer.address);
	console.log("Network:", network.name);

	const Token = await ethers.getContractFactory("ArbitrumTestToken");
	const token = await Token.deploy();
	await token.deployed();

	console.log("Token deployed to:", token.address);

	// Optional: Store the new token address in the console output
	// for easy copying to the .env file
	console.log("\nAdd this to your .env file:");
	console.log(`TOKEN_ADDRESS=${token.address}`);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
