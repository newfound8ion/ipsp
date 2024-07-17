// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {IEnergyMinter} from "./interfaces/IEnergyMinter.sol";
import {IERC721Burnable} from "./interfaces/IERC721Burnable.sol";
import {IERC1155Burnable} from "./interfaces/IERC1155Burnable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ERC1155HolderUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/utils/ERC1155HolderUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/// @title BadgeScorer
/// @notice A contract that allows users to burn NFTs from supported collections to receive energy points.
contract BadgeScorer is
    Initializable,
    ERC1155HolderUpgradeable,
    OwnableUpgradeable
{
    IEnergyMinter private energyMinter;

    /// @notice A mapping that keeps track of which ERC721 collections are supported.
    mapping(address => bool) public erc721Collections;

    /// @notice A mapping that keeps track of which ERC1155 collections are supported.
    mapping(address => bool) public erc1155Collections;

    /// @notice A mapping that keeps track of the energy ID a collection can increase.
    mapping(address => uint8) public collectionEnergyIds;

    /// @notice A mapping that keeps track of the amount each collection can increase.
    mapping(address => uint256) public collectionEnergyAmounts;

    /// @notice A mapping that keeps track if a collection will burn the NFTs when redeemed.
    mapping(address => bool) public collectionBurnable;

    /// @notice A mapping that keeps track of which ERC721 tokens have been redeemed per contract.
    mapping(address => mapping(uint256 => bool)) public redeemedErc721;

    error UnknownCollection(address collection);
    error NonBurnableCollection(address collection);
    error NonRedeemableCollection(address collection);
    error AlreadyRedeemed(address collection, uint256 tokenId);
    error NotTokenOwner();

    /// @notice Emitted when a collection is added.
    /// @param collection The address of the collection.
    /// @param energyId The energy ID that will be increased.
    /// @param energyAmount The amount of energy points that will be increased.
    /// @param burnable Whether the NFTs will be burned when redeemed.
    event CollectionAdded(
        address collection,
        uint8 energyId,
        uint256 energyAmount,
        bool burnable
    );

    /// @notice Emitted when a collection is removed.
    /// @param collection The address of the collection.
    event CollectionRemoved(address collection);

    /// @notice Emitted when an ERC721 token is redeemed.
    /// @param collection The address of the collection.
    /// @param tokenId The ID of the token.
    /// @param owner The owner of the token.
    /// @param energyId The energy ID that was increased.
    /// @param energyAmount The amount of energy points that were increased.
    event ERC721Redeemed(
        address indexed collection,
        uint256 tokenId,
        address indexed owner,
        uint8 energyId,
        uint256 energyAmount
    );

    /// @notice Emitted when an ERC1155 token is redeemed.
    /// @param collection The address of the collection.
    /// @param tokenId The ID of the token.
    /// @param amount The amount of tokens that were redeemed.
    /// @param owner The owner of the token.
    /// @param energyId The energy ID that was increased.
    /// @param energyAmount The amount of energy points that were increased.
    event ERC1155Redeemed(
        address indexed collection,
        uint256 tokenId,
        uint256 amount,
        address indexed owner,
        uint8 energyId,
        uint256 energyAmount
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializes the contract with the EnergyMinter contract.
    /// @param _energyMinter The address of the contract that mints energy tokens.
    function initialize(address _energyMinter) public initializer {
        __Ownable_init();
        __ERC1155Holder_init();

        energyMinter = IEnergyMinter(_energyMinter);
    }

    /// @notice Adds an ERC721 collection to the supported list.
    /// @param collection The address of the ERC721 collection.
    /// @param energyId The energy ID that corresponds to this collection.
    /// @param energyAmount The amount of energy points to be minted for burning an NFT from this collection.
    /// @param burnable Whether the NFTs from this collection will be burned.
    function addERC721Collection(
        address collection,
        uint8 energyId,
        uint256 energyAmount,
        bool burnable
    ) external onlyOwner {
        erc721Collections[collection] = true;
        collectionEnergyIds[collection] = energyId;
        collectionEnergyAmounts[collection] = energyAmount;
        collectionBurnable[collection] = burnable;

        emit CollectionAdded(collection, energyId, energyAmount, burnable);
    }

    /// @notice Removes an ERC721 collection from the supported list.
    /// @param collection The address of the ERC721 collection.
    function removeERC721Collection(address collection) external onlyOwner {
        delete erc721Collections[collection];
        delete collectionEnergyIds[collection];
        delete collectionEnergyAmounts[collection];
        delete collectionBurnable[collection];

        emit CollectionRemoved(collection);
    }

    /// @notice Adds an ERC1155 collection to the supported list.
    /// @param collection The address of the ERC1155 collection.
    /// @param energyId The energy ID that corresponds to this collection.
    /// @param energyAmount The amount of energy points to be minted for burning an NFT from this collection.
    function addERC1155Collection(
        address collection,
        uint8 energyId,
        uint256 energyAmount
    ) external onlyOwner {
        erc1155Collections[collection] = true;
        collectionEnergyIds[collection] = energyId;
        collectionEnergyAmounts[collection] = energyAmount;
        collectionBurnable[collection] = true;

        emit CollectionAdded(collection, energyId, energyAmount, true);
    }

    /// @notice Removes an ERC1155 collection from the supported list.
    /// @param collection The address of the ERC1155 collection.
    function removeERC1155Collection(address collection) external onlyOwner {
        delete erc1155Collections[collection];
        delete collectionEnergyIds[collection];
        delete collectionEnergyAmounts[collection];
        delete collectionBurnable[collection];

        emit CollectionRemoved(collection);
    }

    /// @notice Burns an ERC721 token and mints energy points for the user
    /// @param collection The address of the ERC721 collection.
    /// @param tokenId The ID of the ERC721 token to burn.
    /// @dev This function reverts if the collection is not supported, non-burnable or the user is not the owner of the token.
    function burnERC721(address collection, uint256 tokenId) external {
        if (!erc721Collections[collection])
            revert UnknownCollection(collection);
        if (!collectionBurnable[collection])
            revert NonBurnableCollection(collection);
        IERC721Burnable nft = IERC721Burnable(collection);
        if (nft.ownerOf(tokenId) != _msgSender()) revert NotTokenOwner();

        nft.transferFrom(_msgSender(), address(this), tokenId);
        nft.burn(tokenId);

        uint8 energyId = collectionEnergyIds[collection];
        uint256 energyAmount = collectionEnergyAmounts[collection];
        energyMinter.mint(_msgSender(), energyId, energyAmount);

        // Emit redeemed event
        emit ERC721Redeemed(
            collection,
            tokenId,
            _msgSender(),
            energyId,
            energyAmount
        );
    }

    /// @notice Burns an ERC1155 token and mints energy points for the user
    /// @param collection The address of the ERC1155 collection.
    /// @param tokenId The ID of the ERC1155 token to burn.
    /// @param amount The amount of ERC1155 tokens to burn.
    /// @dev This function reverts if the collection is not supported, non-burnable or the user does not have enough tokens to burn.
    function burnERC1155(
        address collection,
        uint256 tokenId,
        uint256 amount
    ) external {
        if (!erc1155Collections[collection])
            revert UnknownCollection(collection);
        IERC1155Burnable nft = IERC1155Burnable(collection);
        if (nft.balanceOf(_msgSender(), tokenId) < amount)
            revert NotTokenOwner();

        nft.safeTransferFrom(_msgSender(), address(this), tokenId, amount, "");
        nft.burn(address(this), tokenId, amount);

        uint8 energyId = collectionEnergyIds[collection];
        uint256 energyAmount = collectionEnergyAmounts[collection];
        energyMinter.mint(_msgSender(), energyId, energyAmount);

        // Emit redeemed event
        emit ERC1155Redeemed(
            collection,
            tokenId,
            amount,
            _msgSender(),
            energyId,
            energyAmount
        );
    }

    /// @notice Redeems an ERC721 token and mints energy points for the user
    /// @param collection  The address of the ERC721 collection.
    /// @param tokenId The ID of the ERC721 token to redeem.
    /// @dev This function reverts if the collection is not supported, non-redeemable, already redeemed or the user is not the owner of the token.
    function redeemERC721(address collection, uint256 tokenId) external {
        if (!erc721Collections[collection])
            revert UnknownCollection(collection);
        if (collectionBurnable[collection])
            revert NonRedeemableCollection(collection);
        IERC721Burnable nft = IERC721Burnable(collection);
        if (nft.ownerOf(tokenId) != _msgSender()) revert NotTokenOwner();
        if (redeemedErc721[collection][tokenId])
            revert AlreadyRedeemed(collection, tokenId);

        redeemedErc721[collection][tokenId] = true;

        uint8 energyId = collectionEnergyIds[collection];
        uint256 energyAmount = collectionEnergyAmounts[collection];
        energyMinter.mint(_msgSender(), energyId, energyAmount);
    }
}
