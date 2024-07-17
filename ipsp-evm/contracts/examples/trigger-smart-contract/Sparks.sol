// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {NTERC1155Upgradeable} from "./extensions/NTERC1155Upgradeable.sol";
import {IEnergyMinter} from "./interfaces/IEnergyMinter.sol";
import {ISparkMinter} from "./interfaces/ISparkMinter.sol";
import {ILinkCreator} from "./interfaces/ILinkCreator.sol";
import {EnergyConstants} from "./EnergyConstants.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {SafeERC20Upgradeable, IERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";

/// @title Sparks
/// @notice The Sparks are ERC1155 tokens that can be burned to award points to users.
contract Sparks is
    Initializable,
    NTERC1155Upgradeable,
    ISparkMinter,
    OwnableUpgradeable
{
    using SafeERC20Upgradeable for IERC20Upgradeable;

    // External contracts
    IEnergyMinter public energyMinter;
    IERC20Upgradeable public currency;

    // Sales recipient
    address public salesRecipient;

    // Token minters
    mapping(address => bool) public tokenMinters;

    // Price in ERC20 currency
    uint256 public tokenPriceInCurrency;
    uint256 public energyPerSpark;

    ILinkCreator public linkCreator;

    string public contractURI;

    // Error objects
    error InvalidAddress(address addr);
    error InvalidOrigin();
    error InsufficientPaymentSent(uint256 expectedValue, uint256 actualValue);
    error InsufficientTokenBalance(address account, uint256 amount);
    error UnauthorizedMinter(address minter);
    error UnsuccesfulTransfer(address recipient, uint256 amount);
    error InvalidRewardsRecipient(address recipient);
    error InvalidPublicKey();
    error InviteWithZeroSparks();
    error InvalidSparksAmount();

    // Events
    event SparksAwarded(
        address account,
        uint256 amount,
        address recipient,
        uint256 energyAmount
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializes the contract, using OpenZeppelin's upgradeable contracts framework.
    /// @param _uri The URI of the token metadata.
    /// @param _energyMinter The address of the contract that mints energy tokens.
    /// @param _currency The address of the ERC20 contract to use as currency.
    /// @param _salesRecipient The address of the recipient of the sales.
    function initialize(
        string calldata _uri,
        address _energyMinter,
        address _currency,
        address _salesRecipient
    ) public initializer {
        __Ownable_init();
        __NTERC1155_init(_uri);
        energyMinter = IEnergyMinter(_energyMinter);
        tokenPriceInCurrency = 0.1 ether;
        currency = IERC20Upgradeable(_currency);
        energyPerSpark = 10 ether;
        salesRecipient = _salesRecipient;
    }

    /// @notice Modifier that checks only allowed minters can call the function
    modifier onlyMinter() {
        address minter = _msgSender();
        if (!tokenMinters[minter]) {
            revert UnauthorizedMinter(minter);
        }
        _;
    }

    /// @notice Modifier that checks if an address is not zero.
    /// @param addr Address.
    modifier nonZeroAddress(address addr) {
        if (addr == address(0)) {
            revert InvalidAddress(addr);
        }
        _;
    }

    modifier onlyEOA() {
        if (tx.origin != _msgSender()) {
            revert InvalidOrigin();
        }
        _;
    }

    /// @notice Adds a minter
    /// @dev Throws if not called by the owner or if the address is zero.
    /// @param minter Address of the allowed minter.
    function addTokenMinter(
        address minter
    ) external onlyOwner nonZeroAddress(minter) {
        tokenMinters[minter] = true;
    }

    /// @notice Removes a minter
    /// @dev Throws if not called by the owner or if the address is zero.
    /// @param minter Address of the allowed minter.
    function revokeTokenMinter(address minter) external onlyOwner {
        delete tokenMinters[minter];
    }

    /// @notice Updates the link creator.
    /// @dev Throws if not called by the owner.
    function setLinkCreator(
        address _linkCreator
    ) external onlyOwner nonZeroAddress(_linkCreator) {
        linkCreator = ILinkCreator(_linkCreator);
    }

    /// @notice Updates the token price in the ERC20 currency.
    /// @dev Throws if not called by the owner.
    function updateTokenPrice(
        address _currency,
        uint256 _tokenPriceInCurrency
    ) external onlyOwner {
        currency = IERC20Upgradeable(_currency);
        tokenPriceInCurrency = _tokenPriceInCurrency;
    }

    /// @notice Updates the sales recipient.
    /// @dev Throws if not called by the owner.
    function updateSalesRecipient(
        address _salesRecipient
    ) external onlyOwner nonZeroAddress(_salesRecipient) {
        salesRecipient = _salesRecipient;
    }

    /// @notice Updates the uri of the token.
    /// @dev Throws if not called by the owner.
    function updateURI(string calldata _uri) external onlyOwner {
        _setURI(_uri);
    }

    /// @notice Updates the contract URI.
    /// @dev Throws if not called by the owner.
    function updateContractURI(
        string calldata _contractURI
    ) external onlyOwner {
        contractURI = _contractURI;
    }

    /// @notice Mint a token to the provided account.
    /// @dev Throws if the caller is not a minter.
    /// @param account Recipient of the token.
    /// @param amount Tokens to mint.
    function mint(
        address account,
        uint256 amount
    ) external override onlyMinter {
        // Check if amount is greater than 0
        if (amount == 0) {
            revert InvalidSparksAmount();
        }

        // Mint the token
        _mint(account, 0, amount, "");
    }

    /// @notice Award sparks to the provided account.
    /// @dev Throws if the caller is not a minter.
    /// @param from The awarder.
    /// @param amount Tokens to mint.
    /// @param recipient Recipient of the points.
    function award(
        address from,
        uint256 amount,
        address recipient
    ) external override onlyMinter {
        // Check if amount is greater than 0
        if (amount == 0) {
            revert InvalidSparksAmount();
        }
        _awardSparks(from, amount, recipient);
    }

    /// @notice Buys and mints a token to the provided account.
    /// @dev Throws if the caller is not a minter.
    /// @param account Recipient of the token.
    /// @param amount Tokens to mint.
    function buySparks(address account, uint256 amount) external onlyEOA {
        // Check if amount is greater than 0
        if (amount == 0) {
            revert InvalidSparksAmount();
        }

        // Charge the user
        _chargeSparks(amount);

        // Mint the token
        _mint(account, 0, amount, "");
    }

    /// @notice Buys sparks and rewards another address with CWATT.
    /// @param amount Tokens to mint.
    /// @param recipient Recipient of the points.
    function buyAndRewardSparks(
        uint256 amount,
        address recipient
    ) external onlyEOA {
        // Check if amount is greater than 0
        if (amount == 0) {
            revert InvalidSparksAmount();
        }

        // Check if the caller is the owner of the token
        address account = _msgSender();

        // Check if the recipient is valid
        if (recipient == address(0)) {
            revert InvalidRewardsRecipient(recipient);
        }

        // Charge the user
        _chargeSparks(amount);

        // Award the points
        _awardSparks(account, amount, recipient);
    }

    /// @notice Burns a token from the provided account and awards the points to an address.
    /// @param amount Tokens to burn.
    /// @param recipient Recipient of the points.
    /// @dev Throws if the caller is not the owner of the token.
    function burnAndRewardSparks(
        uint256 amount,
        address recipient
    ) external onlyEOA {
        address account = _msgSender();

        // Check if amount is greater than 0
        if (amount == 0) {
            revert InvalidSparksAmount();
        }

        // Check if the recipient is valid
        if (recipient == address(0)) {
            revert InvalidRewardsRecipient(recipient);
        }

        // Burn the tokens
        _burn(account, 0, amount);

        // Award the points
        _awardSparks(account, amount, recipient);
    }

    /// @notice Burns sparks from the sender and creates an invite link.
    /// @param amountToBurn Amount of sparks to burn.
    /// @param amountToBuy Amount of sparks to buy.
    /// @param publicKey Public key of the invite.
    /// @dev Throws if the caller is not the owner of the token.
    function createInvite(
        uint256 amountToBurn,
        uint256 amountToBuy,
        address publicKey,
        string calldata tag
    ) external onlyEOA returns (uint256) {
        // Burn the tokens
        address account = _msgSender();

        uint256 totalSparks = amountToBurn + amountToBuy;
        if (totalSparks == 0) {
            revert InviteWithZeroSparks();
        }

        // Burn the tokens
        if (amountToBurn > 0) {
            _burn(account, 0, amountToBurn);
        }

        // Charge the user
        if (amountToBuy > 0) {
            _chargeSparks(amountToBuy);
        }

        // Create the invite
        return linkCreator.createLink(account, totalSparks, publicKey, tag);
    }

    /// @notice Charges the user for the sparks.
    /// @param amount Tokens to mint.
    function _chargeSparks(uint256 amount) internal {
        address sender = _msgSender();
        uint256 totalAmount = amount * tokenPriceInCurrency;

        // Transfer the payment to the sales recipient
        currency.safeTransferFrom(sender, salesRecipient, totalAmount);
    }

    /// @notice Awards the user with CWATT.
    /// @param amount Sparks to award.
    function _awardSparks(
        address from,
        uint256 amount,
        address recipient
    ) internal {
        // Mint an amount of CWATT for every 1 SPARK
        uint256 energyAmount = amount * energyPerSpark;
        energyMinter.mint(recipient, EnergyConstants.CWATT, energyAmount);

        // Emit event
        emit SparksAwarded(from, amount, recipient, energyAmount);
    }
}
