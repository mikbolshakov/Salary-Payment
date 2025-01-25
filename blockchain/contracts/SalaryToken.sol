// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title SalaryToken
 * @notice A token contract for managing employee salaries.
 * @dev Inherits from OpenZeppelin's ERC20 and ERC20Permit contracts.
 */
contract SalaryToken is ERC20, ERC20Permit {
    /**
     * @dev Constructor that initializes the token with a name, symbol,
     * and mints an initial supply of tokens to the deployer.
     */
    constructor() ERC20("SalaryToken", "STK") ERC20Permit("SalaryToken") {
        // Mint 1 million tokens to the deployer's address
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }
}
