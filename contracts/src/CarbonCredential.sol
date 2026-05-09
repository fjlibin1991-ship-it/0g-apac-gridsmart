// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title CarbonCredential
/// @notice Mintable carbon offset credentials per verified kWh of renewable energy.
///         Each NFT represents 1 kWh of clean energy with full provenance on-chain.
contract CarbonCredential is ERC721, ERC721URIStorage, Ownable {
    uint256 private _credentialIdCounter;

    struct Credential {
        uint256 kwh;               // kWh of clean energy
        uint256 producerNodeId;     // EnergyNodeRegistry tokenId
        uint256 mintedAt;
        address mintedBy;
        bool used;                 // has been retired/claimed
    }

    mapping(uint256 => Credential) public credentials;
    mapping(uint256 => uint256[]) public nodeCredentials; // nodeId → credentialIds

    event CredentialMinted(uint256 indexed id, uint256 kwh, uint256 indexed nodeId, address indexed to);
    event CredentialRetired(uint256 indexed id, address indexed retiredBy);

    constructor() ERC721("GridShare Carbon", "GCC") Ownable(msg.sender) {}

    /// @notice Mint a carbon credential for a verified kWh production event
    /// @param to Recipient (producer or their designated account)
    /// @param kwh Amount of clean energy produced
    /// @param producerNodeId EnergyNodeRegistry tokenId (for provenance)
    /// @param metadataURI IPFS URI with production proof (sensor reading, weather data, etc.)
    function mintCredential(
        address to,
        uint256 kwh,
        uint256 producerNodeId,
        string calldata metadataURI
    ) external onlyOwner returns (uint256 credentialId) {
        require(kwh > 0, "kWh must be positive");

        credentialId = _credentialIdCounter++;
        _safeMint(to, credentialId);
        _setTokenURI(credentialId, metadataURI);

        credentials[credentialId] = Credential({
            kwh: kwh,
            producerNodeId: producerNodeId,
            mintedAt: block.timestamp,
            mintedBy: msg.sender,
            used: false
        });

        nodeCredentials[producerNodeId].push(credentialId);

        emit CredentialMinted(credentialId, kwh, producerNodeId, to);
        return credentialId;
    }

    /// @notice Retire a credential (claim carbon offset / ESG credit)
    function retireCredential(uint256 credentialId) external {
        require(ownerOf(credentialId) == msg.sender, "Not authorized");
        require(!credentials[credentialId].used, "Already retired");

        credentials[credentialId].used = true;
        emit CredentialRetired(credentialId, msg.sender);
    }

    /// @notice Get all credential IDs for a node
    function getNodeCredentials(uint256 nodeId) external view returns (uint256[] memory) {
        return nodeCredentials[nodeId];
    }

    /// @notice Get credential data
    function getCredential(uint256 credentialId) external view returns (Credential memory) {
        require(_ownerOf(credentialId) != address(0), "Credential does not exist");
        return credentials[credentialId];
    }

    // ERC721URIStorage overrides
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
