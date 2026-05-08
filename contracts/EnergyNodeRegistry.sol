// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title EnergyNodeRegistry
/// @notice Registers energy producer/consumer nodes as ERC721 tokens (Agent ID).
///         Each node has an energy profile: type, capacity (kW), location, status.
contract EnergyNodeRegistry is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    enum NodeType { Producer, Consumer, Prosumer, GridOperator }
    enum NodeStatus { Offline, Online, Suspended }

    struct EnergyNode {
        NodeType nodeType;
        uint256 capacityKW;       // max production (if producer) or consumption (if consumer)
        string location;          // city/region string
        string metadataURI;       // IPFS URI with full profile
        NodeStatus status;
        uint256 registeredAt;
        address registeredBy;
    }

    mapping(uint256 => EnergyNode) public nodes;
    mapping(address => uint256[]) public ownerNodes;

    event NodeRegistered(uint256 indexed tokenId, address indexed owner, NodeType nodeType, uint256 capacityKW);
    event NodeStatusUpdated(uint256 indexed tokenId, NodeStatus status);
    event NodeCapacityUpdated(uint256 indexed tokenId, uint256 newCapacityKW);

    constructor() ERC721("GridShareNode", "GSN") Ownable(msg.sender) {}

    /// @notice Register a new energy node and mint its Agent ID NFT
    function registerNode(
        address to,
        NodeType nodeType,
        uint256 capacityKW,
        string calldata location,
        string calldata metadataURI
    ) external returns (uint256 tokenId) {
        require(capacityKW > 0, "Capacity must be positive");

        tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        nodes[tokenId] = EnergyNode({
            nodeType: nodeType,
            capacityKW: capacityKW,
            location: location,
            metadataURI: metadataURI,
            status: NodeStatus.Online,
            registeredAt: block.timestamp,
            registeredBy: msg.sender
        });

        ownerNodes[to].push(tokenId);

        emit NodeRegistered(tokenId, to, nodeType, capacityKW);
        return tokenId;
    }

    /// @notice Update node status (e.g., go offline for maintenance)
    function updateNodeStatus(uint256 tokenId, NodeStatus newStatus) external {
        require(ownerOf(tokenId) == msg.sender || owner() == msg.sender, "Not authorized");
        nodes[tokenId].status = newStatus;
        emit NodeStatusUpdated(tokenId, newStatus);
    }

    /// @notice Update capacity (e.g., added solar panels)
    function updateCapacity(uint256 tokenId, uint256 newCapacityKW) external {
        require(ownerOf(tokenId) == msg.sender, "Not authorized");
        require(newCapacityKW > 0, "Capacity must be positive");
        nodes[tokenId].capacityKW = newCapacityKW;
        emit NodeCapacityUpdated(tokenId, newCapacityKW);
    }

    /// @notice Get all node IDs owned by an address
    function getOwnerNodes(address owner) external view returns (uint256[] memory) {
        return ownerNodes[owner];
    }

    /// @notice Get full node data
    function getNode(uint256 tokenId) external view returns (EnergyNode memory) {
        require(_exists(tokenId), "Node does not exist");
        return nodes[tokenId];
    }

    /// @notice Check if an address owns an active (online) node — required by EnergyMarketplace
    function isNodeActive(address owner) external view returns (bool) {
        uint256[] memory nodeIds = ownerNodes[owner];
        for (uint256 i = 0; i < nodeIds.length; i++) {
            if (nodes[nodeIds[i]].status == NodeStatus.Online) {
                return true;
            }
        }
        return false;
    }

    // ERC721URIStorage overrides
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
