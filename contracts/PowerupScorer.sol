// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {IEnergyMinter} from "./interfaces/IEnergyMinter.sol";
import {EnergyConstants} from "./EnergyConstants.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/// @title PowerUpScorer
/// @notice A contract that allows users to power up other users
contract PowerUpScorer is Initializable, OwnableUpgradeable {
    /// @notice A struct that keeps track of the user streaks and experience
    struct UserData {
        uint32 lastPowerUpDate;
        uint32 powerUpStreak;
        uint32 powerUpCounter;
    }

    uint32 private constant MAX_DAILY_STREAK = 10;
    uint256 private constant MIN_CWATTS = 10 ether;

    /// @dev The EnergyMinter contract.
    IEnergyMinter private energyMinter;

    /// @notice The score that will be increased when a user is powered up.
    uint256 public powerUpScore;

    /// @notice The amount of energy that will be increased when a user powers up any other user daily.
    uint256 public dailyEnergyScore;

    /// @notice The amount of energy that will be increased when a user reaches an experience milestone.
    uint256 public experienceScore;

    /// @notice A mapping that keeps track of which users have been powered up by which users.
    mapping(address => mapping(address => bool)) public powerUps;

    /// @notice A mapping that keeps track of the user streaks and experience
    mapping(address => UserData) public userData;

    /// @notice A mapping that keeps track of the milestones that will award points when the powerup counter is reached.
    mapping(uint256 => bool) public experienceMilestones;

    /// @notice Throws if the user has already been powered up by this address.
    error AlreadyPoweredUp();

    /// @notice Throws if the user is not a valid recipient.
    error InvalidRecipient(address recipient);

    /// @notice Throws if the user does not have enough CWATT.
    error NotEnoughCWATT(uint256 required, uint256 available);

    /// @notice Emitted when a user is powered up.
    event PoweredUp(address indexed from, address indexed to, uint256 score);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializes the contract with the EnergyMinter contract.
    /// @param _energyMinter The address of the contract that mints energy tokens.
    function initialize(address _energyMinter) public initializer {
        __Ownable_init();

        energyMinter = IEnergyMinter(_energyMinter);
        powerUpScore = 1 ether;
        dailyEnergyScore = 1 ether;
        experienceScore = 1 ether;

        uint24[14] memory milestones = [
            1,
            5,
            10,
            50,
            100,
            500,
            1000,
            5000,
            10000,
            50000,
            100000,
            500000,
            1000000,
            5000000
        ];
        for (uint i = 0; i < milestones.length; ) {
            experienceMilestones[milestones[i]] = true;
            unchecked {
                i++;
            }
        }
    }

    /// @notice Sets the score that will be increased when a user is powered up.
    /// @param score The score
    function setPowerUpScore(uint256 score) external onlyOwner {
        powerUpScore = score;
    }

    /// @notice Sets the score that will be increased when a user powers up any other user daily.
    /// @param score The score
    function setDailyEnergyScore(uint256 score) external onlyOwner {
        dailyEnergyScore = score;
    }

    /// @notice Sets the score that will be increased when a user reaches an experience milestone.
    /// @param score The score
    function setExperienceScore(uint256 score) external onlyOwner {
        experienceScore = score;
    }

    /// @notice Allows a user to power up another user.
    /// @param to The address of the user that will be powered up.
    /// @dev Throws if the recipient has already been powered up by the sender or if it is invalid.
    function powerUp(address to) external {
        address from = _msgSender();

        // Check if the user is a valid recipient
        if (to == address(0) || to == from) revert InvalidRecipient(to);

        // Check if the user has enough CWATT
        uint256 availableCWATT = energyMinter.balanceOfEnergy(
            from,
            EnergyConstants.CWATT
        );
        if (availableCWATT < MIN_CWATTS) {
            revert NotEnoughCWATT(MIN_CWATTS, availableCWATT);
        }

        // Check if the user has already been powered up by this address
        if (powerUps[from][to]) revert AlreadyPoweredUp();
        powerUps[from][to] = true;

        // Update power-up streak and last power-up date
        uint256 currentDay = block.timestamp / 1 days;
        uint32 userLastPowerUpDate = userData[from].lastPowerUpDate;
        uint32 userPowerUpStreak = userData[from].powerUpStreak;
        uint32 userPowerUpCounter = userData[from].powerUpCounter;

        uint256 loyaltyToMint = 0;
        uint256 experienceToMint = 0;

        // Check if the user powered up today or if it's a new day
        if (userLastPowerUpDate != currentDay) {
            if (currentDay > userLastPowerUpDate + 1) {
                // Reset the streak if the user missed a daily power-up
                userPowerUpStreak = 1;
            } else {
                // Increment the streak if the user powered up daily
                userPowerUpStreak = userPowerUpStreak < MAX_DAILY_STREAK
                    ? userPowerUpStreak + 1
                    : MAX_DAILY_STREAK;
            }

            // Update power-up streak and last power-up date
            userData[from].powerUpStreak = userPowerUpStreak;
            userData[from].lastPowerUpDate = uint32(currentDay);

            // Mint loyaly energy based on the power-up streak
            loyaltyToMint = dailyEnergyScore * userPowerUpStreak;
        }

        userPowerUpCounter += 1;
        if (experienceMilestones[userPowerUpCounter]) {
            experienceToMint = experienceScore * userPowerUpCounter;
        }

        userData[from].powerUpCounter = userPowerUpCounter;

        // Get NWATT balance
        uint256 score = (energyMinter.balanceOfEnergy(
            from,
            EnergyConstants.NWATT
        ) / 10) + powerUpScore;

        if (loyaltyToMint > 0) {
            // Mint loyalty energy
            energyMinter.mint(from, EnergyConstants.LWATT, loyaltyToMint);
        }

        if (experienceToMint > 0) {
            // Mint experience energy
            energyMinter.mint(
                from,
                EnergyConstants.XWATT,
                experienceScore * userPowerUpCounter
            );
        }

        // Powerup a new user
        energyMinter.mint(to, EnergyConstants.PWATT, score);

        // Emit event
        emit PoweredUp(from, to, score);
    }
}
