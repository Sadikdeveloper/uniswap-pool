// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;  // Changed to match config

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ArbitrumTestToken is ERC20 {
    constructor() ERC20("Arbitrum Test Token", "ATT") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}