// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./EnergyToken.sol";
import "./EnergyNodeRegistry.sol";
import "./CarbonCredential.sol";

/**
 * @title EnergyMarketplace
 * @notice P2P energy trading marketplace with AI-optimized routing
 * @dev Matches energy producers with consumers, settles payments via EnergyToken
 */
contract EnergyMarketplace is Ownable, ReentrancyGuard {

    /// @notice Emitted when a new energy listing is created
    event ListingCreated(
        bytes32 indexed listingId,
        address indexed producer,
        uint256 pricePerKwh,
        uint256 availableKwh
    );

    /// @notice Emitted when a listing is updated
    event ListingUpdated(bytes32 indexed listingId, uint256 newPricePerKwh, uint256 newAvailableKwh);

    /// @notice Emitted when a listing is filled
    event ListingFilled(bytes32 indexed listingId, address indexed consumer, uint256 kwhSold);

    /// @notice Emitted when energy order is matched
    event EnergyTraded(
        bytes32 indexed orderId,
        bytes32 indexed listingId,
        address producer,
        address consumer,
        uint256 kwh,
        uint256 totalCost
    );

    /// @notice Listing status
    enum ListingStatus { Active, Filled, Cancelled }

    /// @notice Energy listing structure
    struct EnergyListing {
        bytes32 listingId;
        address producer;
        uint256 pricePerKwh;   // in EnergyToken units
        uint256 availableKwh;
        uint256 totalKwh;
        ListingStatus status;
        uint256 createdAt;
        string metadataURI;    // 0G Storage URI with real-time sensor data
    }

    /// @notice Energy order structure
    struct EnergyOrder {
        bytes32 orderId;
        bytes32 listingId;
        address consumer;
        address producer;
        uint256 kwh;
        uint256 totalCost;
        bool settled;
        uint256 settledAt;
    }

    /// @notice References to other contracts
    EnergyToken public immutable energyToken;
    EnergyNodeRegistry public immutable nodeRegistry;
    CarbonCredential public immutable carbonCredential;

    /// @notice Listings mapping
    mapping(bytes32 => EnergyListing) public listings;

    /// @notice Orders mapping
    mapping(bytes32 => EnergyOrder) public orders;

    /// @notice Active listing IDs per producer
    mapping(address => bytes32[]) public producerListings;

    /// @notice Accumulated platform fees (in EnergyToken)
    uint256 public platformFees;

    /// @notice Emitted when platform fees are withdrawn
    event PlatformFeeWithdrawn(address indexed recipient, uint256 amount);

    /// @notice Minimum listing size (0.1 kWh)
    uint256 public constant MIN_KWH = 0.1 ether; // Using ether units for decimal precision

    /// @notice Maximum price per kWh (1000 tokens)
    uint256 public constant MAX_PRICE = 1000 ether;

    constructor(
        address _energyToken,
        address _nodeRegistry,
        address _carbonCredential,
        address initialOwner
    ) Ownable(initialOwner) {
        require(_energyToken != address(0), "EnergyMarketplace: invalid token address");
        require(_nodeRegistry != address(0), "EnergyMarketplace: invalid registry address");
        require(_carbonCredential != address(0), "EnergyMarketplace: invalid carbon address");
        energyToken = EnergyToken(_energyToken);
        nodeRegistry = EnergyNodeRegistry(_nodeRegistry);
        carbonCredential = CarbonCredential(_carbonCredential);
    }

    /**
     * @notice Create a new energy listing
     * @param listingId Unique listing ID
     * @param pricePerKwh Price per kWh in EnergyToken
     * @param availableKwh Available energy in kWh
     * @param metadataURI 0G Storage URI with sensor/production data
     */
    function createListing(
        bytes32 listingId,
        uint256 pricePerKwh,
        uint256 availableKwh,
        string calldata metadataURI
    ) external nonReentrant {
        require(listingId != bytes32(0), "EnergyMarketplace: invalid listing ID");
        require(pricePerKwh > 0 && pricePerKwh <= MAX_PRICE, "EnergyMarketplace: invalid price");
        require(availableKwh >= MIN_KWH, "EnergyMarketplace: listing too small");
        require(bytes(metadataURI).length > 0, "EnergyMarketplace: empty metadata URI");
        require(listings[listingId].producer == address(0), "EnergyMarketplace: listing exists");
        require(nodeRegistry.isNodeActive(msg.sender), "EnergyMarketplace: not an active node");

        listings[listingId] = EnergyListing({
            listingId: listingId,
            producer: msg.sender,
            pricePerKwh: pricePerKwh,
            availableKwh: availableKwh,
            totalKwh: availableKwh,
            status: ListingStatus.Active,
            createdAt: block.timestamp,
            metadataURI: metadataURI
        });

        producerListings[msg.sender].push(listingId);

        emit ListingCreated(listingId, msg.sender, pricePerKwh, availableKwh);
    }

    /**
     * @notice Update an active listing price/availability
     * @param listingId Listing ID
     * @param newPricePerKwh New price per kWh
     * @param newAvailableKwh New available kWh
     */
    function updateListing(
        bytes32 listingId,
        uint256 newPricePerKwh,
        uint256 newAvailableKwh
    ) external nonReentrant {
        EnergyListing storage listing = listings[listingId];
        require(listing.producer == msg.sender, "EnergyMarketplace: not owner");
        require(listing.status == ListingStatus.Active, "EnergyMarketplace: listing not active");
        require(newPricePerKwh > 0 && newPricePerKwh <= MAX_PRICE, "EnergyMarketplace: invalid price");

        listing.pricePerKwh = newPricePerKwh;
        listing.availableKwh = newAvailableKwh;

        emit ListingUpdated(listingId, newPricePerKwh, newAvailableKwh);
    }

    /**
     * @notice Fill (buy) an energy listing
     * @param listingId Listing ID to fill
     * @param orderId Unique order ID
     * @param kwh Amount of energy to purchase
     * @dev Consumer must approve EnergyToken transfer before calling
     */
    function fillListing(
        bytes32 listingId,
        bytes32 orderId,
        uint256 kwh
    ) external nonReentrant {
        require(orderId != bytes32(0), "EnergyMarketplace: invalid order ID");
        require(kwh >= MIN_KWH, "EnergyMarketplace: order too small");

        EnergyListing storage listing = listings[listingId];
        require(listing.status == ListingStatus.Active, "EnergyMarketplace: listing not active");
        require(listing.availableKwh >= kwh, "EnergyMarketplace: insufficient energy");
        require(listing.producer != msg.sender, "EnergyMarketplace: cannot buy own energy");

        uint256 totalCost = (kwh * listing.pricePerKwh) / 1 ether;

        // Transfer tokens from consumer to this contract (escrow)
        require(
            energyToken.transferFrom(msg.sender, address(this), totalCost),
            "EnergyMarketplace: token transfer failed"
        );

        // Update listing
        listing.availableKwh -= kwh;
        // Mark as Filled when depleted (zero or below minimum threshold)
        if (listing.availableKwh == 0 || listing.availableKwh < MIN_KWH) {
            listing.status = ListingStatus.Filled;
            emit ListingFilled(listingId, msg.sender, kwh);
        }

        // Create order
        orders[orderId] = EnergyOrder({
            orderId: orderId,
            listingId: listingId,
            consumer: msg.sender,
            producer: listing.producer,
            kwh: kwh,
            totalCost: totalCost,
            settled: false,
            settledAt: 0
        });

        emit EnergyTraded(orderId, listingId, listing.producer, msg.sender, kwh, totalCost);
    }

    /**
     * @notice Settle an order — release tokens to producer, mint carbon credential
     * @param orderId Order ID
     */
    function settleOrder(bytes32 orderId) external nonReentrant {
        EnergyOrder storage order = orders[orderId];
        require(!order.settled, "EnergyMarketplace: already settled");
        require(
            order.consumer == msg.sender || order.producer == msg.sender || msg.sender == owner(),
            "EnergyMarketplace: not authorized"
        );

        // Transfer tokens to producer (90% — 10% platform fee)
        uint256 producerShare = (order.totalCost * 90) / 100;
        uint256 feeShare = order.totalCost - producerShare; // 10% platform fee
        platformFees += feeShare;
        require(
            energyToken.transfer(order.producer, producerShare),
            "EnergyMarketplace: producer transfer failed"
        );

        order.settled = true;
        order.settledAt = block.timestamp;

        // Mint carbon credential for producer (1 credential per 100 kWh)
        uint256 carbonUnits = order.kwh / 100;
        if (carbonUnits > 0) {
            carbonCredential.mintCredential(
                order.producer,
                carbonUnits,
                0, // producerNodeId - pass 0 as placeholder (node registry integration needed)
                string.concat("Green energy produced: ", uint2str(order.kwh), " kWh")
            );
        }
    }

    /**
     * @notice Cancel an unfilled listing
     * @param listingId Listing ID
     */
    function cancelListing(bytes32 listingId) external nonReentrant {
        EnergyListing storage listing = listings[listingId];
        require(listing.producer == msg.sender, "EnergyMarketplace: not owner");
        require(listing.status == ListingStatus.Active, "EnergyMarketplace: not active");

        listing.status = ListingStatus.Cancelled;
    }

    /**
     * @notice Withdraw accumulated platform fees (only owner)
     * @param recipient Address to receive fees
     */
    function withdrawPlatformFees(address recipient) external onlyOwner nonReentrant {
        require(recipient != address(0), "EnergyMarketplace: invalid recipient");
        uint256 amount = platformFees;
        require(amount > 0, "EnergyMarketplace: no fees to withdraw");
        platformFees = 0;
        require(
            energyToken.transfer(recipient, amount),
            "EnergyMarketplace: fee transfer failed"
        );
        emit PlatformFeeWithdrawn(recipient, amount);
    }

    /**
     * @notice Get active listings count for a producer
     */
    function getProducerActiveListings(address producer) external view returns (bytes32[] memory) {
        bytes32[] memory all = producerListings[producer];
        uint256 count = 0;
        for (uint256 i = 0; i < all.length; i++) {
            if (listings[all[i]].status == ListingStatus.Active) count++;
        }
        bytes32[] memory result = new bytes32[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < all.length; i++) {
            if (listings[all[i]].status == ListingStatus.Active) {
                result[idx++] = all[i];
            }
        }
        return result;
    }

    /// @notice Helper: uint to string
    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 length = 0;
        uint256 temp = j;
        while (temp != 0) {
            length++;
            temp /= 10;
        }
        bytes memory b = new bytes(length);
        while (j != 0) {
            b[--length] = bytes1(uint8(48 + j % 10));
            j /= 10;
        }
        return string(b);
    }
}
