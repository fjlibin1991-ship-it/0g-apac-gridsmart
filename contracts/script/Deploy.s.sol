// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Script, console2 } from "forge-std/Script.sol";
import { EnergyToken } from "../EnergyToken.sol";
import { EnergyNodeRegistry } from "../EnergyNodeRegistry.sol";
import { CarbonCredential } from "../CarbonCredential.sol";
import { EnergyMarketplace } from "../EnergyMarketplace.sol";

contract Deploy is Script {
    uint256 public constant INITIAL_TOKEN_SUPPLY = 1_000_000_000 ether; // 1 billion GRD tokens

    function run() external {
        console2.log("Starting GridShare deployment...");
        console2.log("Deployer:", msg.sender);
        console2.log("Block number:", block.number);

        // Load private key from environment or use default broadcaster
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy EnergyToken with initial supply
        console2.log("\n[1/4] Deploying EnergyToken...");
        EnergyToken energyToken = new EnergyToken(INITIAL_TOKEN_SUPPLY);
        console2.log("EnergyToken deployed at:", address(energyToken));
        console2.log("  - Name:", energyToken.name());
        console2.log("  - Symbol:", energyToken.symbol());
        console2.log("  - Initial supply:", INITIAL_TOKEN_SUPPLY);

        // 2. Deploy EnergyNodeRegistry
        console2.log("\n[2/4] Deploying EnergyNodeRegistry...");
        EnergyNodeRegistry nodeRegistry = new EnergyNodeRegistry();
        console2.log("EnergyNodeRegistry deployed at:", address(nodeRegistry));
        console2.log("  - Name:", nodeRegistry.name());
        console2.log("  - Symbol:", nodeRegistry.symbol());

        // 3. Deploy CarbonCredential
        console2.log("\n[3/4] Deploying CarbonCredential...");
        CarbonCredential carbonCredential = new CarbonCredential();
        console2.log("CarbonCredential deployed at:", address(carbonCredential));
        console2.log("  - Name:", carbonCredential.name());
        console2.log("  - Symbol:", carbonCredential.symbol());

        // 4. Deploy EnergyMarketplace (passing all three addresses and owner)
        console2.log("\n[4/4] Deploying EnergyMarketplace...");
        EnergyMarketplace marketplace = new EnergyMarketplace(
            address(energyToken),
            address(nodeRegistry),
            address(carbonCredential),
            msg.sender // initialOwner = deployer
        );
        console2.log("EnergyMarketplace deployed at:", address(marketplace));

        // Transfer ownership of CarbonCredential to marketplace (so it can mint credentials)
        carbonCredential.transferOwnership(address(marketplace));
        console2.log("CarbonCredential ownership transferred to marketplace");

        // Transfer ownership of EnergyToken to marketplace (so it can mint/burn tokens)
        energyToken.transferOwnership(address(marketplace));
        console2.log("EnergyToken ownership transferred to marketplace");

        vm.stopBroadcast();

        console2.log("\n=== Deployment Complete ===");
        console2.log("EnergyToken:", address(energyToken));
        console2.log("EnergyNodeRegistry:", address(nodeRegistry));
        console2.log("CarbonCredential:", address(carbonCredential));
        console2.log("EnergyMarketplace:", address(marketplace));
    }
}
