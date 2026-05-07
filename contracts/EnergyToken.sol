// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title EnergyToken
/// @notice P2P energy trading token (can be stablecoin-pegged or native)
contract EnergyToken is ERC20, Ownable {
    // 1 unit = 1 kWh of energy equivalent

    constructor(uint256 initialSupply) ERC20("GridShare Energy", "GRD") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }

    /// @notice Mint tokens for energy producers (called by marketplace after settlement)
    function mintForEnergy(address to, uint256 kwhAmount) external onlyOwner {
        _mint(to, kwhAmount);
    }

    /// @notice Burn tokens for energy consumers (called during purchase)
    function burnForEnergy(address from, uint256 kwhAmount) external onlyOwner {
        _burn(from, kwhAmount);
    }
}
