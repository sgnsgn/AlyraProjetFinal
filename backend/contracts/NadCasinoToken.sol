// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NadCasinoToken is ERC20, Ownable {
    uint8 private _decimals;

    constructor(
        address initialOwner
    ) ERC20("NadCasino", "NADC") Ownable(initialOwner) {
        _decimals = 0;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
