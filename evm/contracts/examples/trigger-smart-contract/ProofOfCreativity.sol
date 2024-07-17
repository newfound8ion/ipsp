// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {Token} from "./Token.sol";
import {IEnergyMinter} from "./interfaces/IEnergyMinter.sol";
import {IMilestoneTracker} from "./interfaces/IMilestoneTracker.sol";
import {IMilestoneAwarder} from "./interfaces/IMilestoneAwarder.sol";
import {EnergyConstants} from "./EnergyConstants.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import {IERC20MetadataUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol";
import {UD60x18, ud, log10} from "@prb/math/src/UD60x18.sol";

/// @title PoC
/// @notice The PoC manages the minting of energy to create WATTS. This contract manages which external can mint energy and the multipliers for each energy type.
/// @dev Explain to a developer any extra details
contract PoC is
    Initializable,
    IERC20Upgradeable,
    IERC20MetadataUpgradeable,
    OwnableUpgradeable,
    IEnergyMinter,
    IMilestoneTracker
{
    // Minimum and maximum multipliers when increasing WATTS
    uint16 public constant MIN_BPS = 1;
    uint16 public constant MAX_BPS = 10000;
    uint16 public constant BPS = 100;

    // Token addresses, multipliers and minters
    mapping(uint8 => address) public tokenAddresses;
    mapping(uint8 => uint16) public tokenMultipliers;
    mapping(uint8 => mapping(address => bool)) public tokenMinters;

    // Watts balances and supply
    mapping(address => uint256) private _balances;
    uint256 private _totalSupply;

    // Track milestones
    mapping(address => uint256) public unlockedMilestones;

    // Milestone awarder
    IMilestoneAwarder public milestoneAwarder;

    // Error objects
    error InvalidMintAmount(uint256 amount, uint256 minAmount);
    error InvalidTokenId(uint256 id, uint256 minId, uint256 maxId);
    error InvalidAddress(address addr);
    error InvalidMinter(address minter);
    error InvalidMultiplier(
        uint16 multiplier,
        uint16 minMultiplier,
        uint16 maxMultiplier
    );
    error TransfersDisabled();

    // Events
    event MilestoneUnlocked(address account, uint256 balanceMilestone);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializes the contract, using OpenZeppelin's upgradeable contracts framework.
    function initialize() public initializer {
        __Ownable_init();

        tokenAddresses[EnergyConstants.CWATT] = address(
            new Token("CWATT", "CWATT", address(this))
        );
        tokenAddresses[EnergyConstants.XWATT] = address(
            new Token("XWATT", "XWATT", address(this))
        );
        tokenAddresses[EnergyConstants.LWATT] = address(
            new Token("LWATT", "LWATT", address(this))
        );
        tokenAddresses[EnergyConstants.NWATT] = address(
            new Token("NWATT", "NWATT", address(this))
        );
        tokenAddresses[EnergyConstants.PWATT] = address(
            new Token("PWATT", "PWATT", address(this))
        );
        tokenAddresses[EnergyConstants.SWATT] = address(
            new Token("SWATT", "SWATT", address(this))
        );
        tokenAddresses[EnergyConstants.VWATT] = address(
            new Token("VWATT", "VWATT", address(this))
        );

        tokenMultipliers[EnergyConstants.CWATT] = BPS;
        tokenMultipliers[EnergyConstants.XWATT] = BPS;
        tokenMultipliers[EnergyConstants.LWATT] = BPS;
        tokenMultipliers[EnergyConstants.NWATT] = BPS;
        tokenMultipliers[EnergyConstants.PWATT] = BPS;
        tokenMultipliers[EnergyConstants.SWATT] = BPS;
        tokenMultipliers[EnergyConstants.VWATT] = BPS;
    }

    /// @notice Modifier that checks only allowed minters can call the function for a specific token id.
    /// @param id Token id.
    modifier onlyMinter(uint8 id) {
        address minter = _msgSender();
        if (!tokenMinters[id][minter]) {
            revert InvalidMinter(minter);
        }
        _;
    }

    /// @notice Modifier that checks if a token id is valid.
    /// @param id Token id.
    modifier validTokenId(uint8 id) {
        if (id < EnergyConstants.CWATT || id > EnergyConstants.VWATT) {
            revert InvalidTokenId({
                id: id,
                minId: EnergyConstants.CWATT,
                maxId: EnergyConstants.VWATT
            });
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

    /// @notice Adds a minter for a token id.
    /// @dev Throws if not called by the owner, if the token id is invalid, or if the address is zero.
    /// @param id Token id.
    /// @param minter Address of the allowed minter.
    function addTokenMinter(
        uint8 id,
        address minter
    ) external onlyOwner validTokenId(id) nonZeroAddress(minter) {
        tokenMinters[id][minter] = true;
    }

    /// @notice Removes a minter for a token id.
    /// @dev Throws if not called by the owner, if the token id is invalid, or if the address is zero.
    /// @param id Token id.
    /// @param minter Address of the allowed minter.
    function revokeTokenMinter(
        uint8 id,
        address minter
    ) external onlyOwner validTokenId(id) nonZeroAddress(minter) {
        delete tokenMinters[id][minter];
    }

    /// @notice Sets a multiplier for a token id. This value will be used to calcualte the WATTS increase.
    /// @dev Throws if not called by the owner, if the token id is invalid, or if the multiplier is invalid.
    /// @param id Token id.
    /// @param multiplier Value between MIN_BPS and MAX_BPS
    function setTokenMultiplier(
        uint8 id,
        uint16 multiplier
    ) external onlyOwner validTokenId(id) {
        if (multiplier < MIN_BPS || multiplier > MAX_BPS) {
            revert InvalidMultiplier({
                multiplier: multiplier,
                minMultiplier: MIN_BPS,
                maxMultiplier: MAX_BPS
            });
        }
        tokenMultipliers[id] = multiplier;
    }

    /// @notice Sets the milestone awarder contract.
    /// @dev Throws if not called by the owner or if the address is zero.
    /// @param _milestoneAwarder Address of the milestone awarder contract.
    function setMilestoneAwarder(
        address _milestoneAwarder
    ) external onlyOwner nonZeroAddress(_milestoneAwarder) {
        milestoneAwarder = IMilestoneAwarder(_milestoneAwarder);
    }

    /// @notice Gets the last milestone unlocked for an account.
    function lastMilestoneUnlocked(
        address account
    ) external view override returns (uint256) {
        return unlockedMilestones[account];
    }

    /// @notice Mint a token to the provided account. The corresponding amount of WATTS will also be minted.
    /// @dev Throws if the token id is invalid, if the amount is less than 1e18, or if the caller is not a minter.
    /// @param account Recipient of the token.
    /// @param id Token id.
    /// @param amount Tokens to mint.
    function mint(
        address account,
        uint8 id,
        uint256 amount
    ) external override validTokenId(id) onlyMinter(id) {
        if (amount < 1e18) {
            revert InvalidMintAmount({amount: amount, minAmount: 1e18});
        }

        Token token = Token(tokenAddresses[id]);
        uint256 balance = token.balanceOf(account);
        token.mint(account, amount);

        // Calculates the increase in watts.
        uint256 wattsIncrease;
        uint16 multiplier = tokenMultipliers[id];
        if (balance > 0) {
            // Calculates the increase taking the previous balance into account.
            // The formula is the simplified version of log10(amount + balance) - log10(balance)
            // to improve the gas efficiency by only calculating the log10 once
            wattsIncrease = log10(ud(amount + balance).div(ud(balance)))
                .intoUint256();
        } else {
            // The increase will only be the log10 of the amount since there is no previous balance.
            wattsIncrease = log10(ud(amount)).intoUint256();
        }

        // Apply the multiplier
        wattsIncrease = (wattsIncrease * multiplier) / BPS;

        // Only mint if there is a watts increase
        if (wattsIncrease > 0) {
            _totalSupply += wattsIncrease;
            uint256 newBalance;
            unchecked {
                // Overflow not possible: balance + wattsIncrease is at most totalSupply + wattsIncrease, which is checked above.
                newBalance = _balances[account] + wattsIncrease;
                _balances[account] = newBalance;
            }

            // Check if the account has reached a new milestone
            _checkMilestones(account, newBalance);

            emit Transfer(address(0), account, wattsIncrease);
        }
    }

    function _checkMilestones(address account, uint256 newBalance) private {
        if (newBalance < 10 ether || newBalance > 90 ether) {
            return;
        }

        uint256 lastMilestone = unlockedMilestones[account];
        uint256 nextBalanceMilestone = (lastMilestone + 1) * 10 ether;
        if (newBalance >= nextBalanceMilestone) {
            uint256 unlockedMilestone = lastMilestone + 1;

            // The account has reached a new milestone
            unlockedMilestones[account] = unlockedMilestone;

            // Award the milestone
            milestoneAwarder.awardMilestonesUnlocked(account);

            emit MilestoneUnlocked(account, nextBalanceMilestone);
        }
    }

    // ERC20 implementation

    /// @notice Returns the name of the token.
    function name() public view virtual override returns (string memory) {
        return "WATT";
    }

    /// @notice Returns the symbol of the token.
    function symbol() public view virtual override returns (string memory) {
        return "WATT";
    }

    /// @notice Returns the number of decimals used to get its user representation.
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    /// @notice Returns the total supply of the token.
    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    /// @notice Returns the balance of the account.
    function balanceOf(
        address account
    ) public view virtual override returns (uint256) {
        return _balances[account];
    }

    /// @notice Returns the balance of the account for a specific token id.
    function balanceOfEnergy(
        address account,
        uint8 id
    ) external view override validTokenId(id) returns (uint256) {
        Token token = Token(tokenAddresses[id]);
        return token.balanceOf(account);
    }

    /// @dev See {IERC20-transfer}. The function is disabled.
    function transfer(address, uint256) public virtual override returns (bool) {
        revert TransfersDisabled();
    }

    /// @dev See {IERC20-allowance}. The function is disabled.
    function allowance(
        address,
        address
    ) public view virtual override returns (uint256) {
        return 0;
    }

    /// @dev See {IERC20-approve}. The function is disabled.
    function approve(address, uint256) public virtual override returns (bool) {
        revert TransfersDisabled();
    }

    /// @dev See {IERC20-transferFrom}. The function is disabled.
    function transferFrom(
        address,
        address,
        uint256
    ) public virtual override returns (bool) {
        revert TransfersDisabled();
    }
}
