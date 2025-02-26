const { ethers } = require('ethers');
require('dotenv').config();


const POOL_ADDRESS = process.env.POOL_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const RPC_URL = process.env.RPC_URL;

const POOL_ABI = [
    "function initialize(uint160 sqrtPriceX96) external",
    "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)"
];

async function main() {
    console.log(`Using pool address: ${POOL_ADDRESS}`);
    
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    try {
        console.log('Connecting to pool...');
        const pool = new ethers.Contract(POOL_ADDRESS, POOL_ABI, wallet);

        // Initialize with a 1:1 price ratio
        const sqrtPriceX96 = ethers.BigNumber.from('79228162514264337593543950336');

        console.log('Initializing pool with price 1:1...');
        const tx = await pool.initialize(sqrtPriceX96);
        console.log('Transaction sent! Hash:', tx.hash);
        
        console.log('Waiting for confirmation...');
        const receipt = await tx.wait();
        console.log('Pool initialization confirmed in block:', receipt.blockNumber);

        // Verify initialization
        const slot0 = await pool.slot0();
        console.log('\nPool initialized with sqrtPrice:', slot0.sqrtPriceX96.toString());

    } catch (error) {
        if (error.reason) {
            console.error('Error reason:', error.reason);
        } else {
            console.error('Error:', error.message || error);
        }
    }
}

main();