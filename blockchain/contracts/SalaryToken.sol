// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Burnable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import { ERC20Pausable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract SalaryToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable {
    mapping(address => bool) public isBlackListed;

    constructor(
        address recipient,
        address initialOwner
    ) ERC20("SalaryToken", "STK") Ownable(initialOwner) {
        _mint(recipient, 1_000_000 * 10 ** decimals());
    }

    function getBlackListStatus(address _maker) external view returns (bool) {
        return isBlackListed[_maker];
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function addBlackList(address _evilUser) public onlyOwner {
        isBlackListed[_evilUser] = true;
    }

    function removeBlackList(address _clearedUser) public onlyOwner {
        isBlackListed[_clearedUser] = false;
    }

    // The following functions are overrides required by Solidity.

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Pausable) {
        require(!isBlackListed[from], "Sender is blacklisted");
        require(!isBlackListed[to], "Recipient is blacklisted");
        super._update(from, to, value);
    }
}
