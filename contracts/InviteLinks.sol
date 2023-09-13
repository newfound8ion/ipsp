// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {ISparkMinter} from "./interfaces/ISparkMinter.sol";
import {IMilestoneTracker} from "./interfaces/IMilestoneTracker.sol";
import {ILinkCreator} from "./interfaces/ILinkCreator.sol";
import {IMilestoneAwarder} from "./interfaces/IMilestoneAwarder.sol";
import {EnergyConstants} from "./EnergyConstants.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {EIP712Upgradeable, ECDSAUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";

/// @title InviteLinks
/// @notice
contract InviteLinks is
    ILinkCreator,
    IMilestoneAwarder,
    Initializable,
    OwnableUpgradeable,
    EIP712Upgradeable
{
    using ECDSAUpgradeable for bytes32;

    bytes32 private constant REDEEM_REQUEST_TYPE_HASH =
        keccak256(
            "RedeemRequest(uint256 linkId,address recipient,uint256 sparks,bytes32 uid)"
        );

    // External contracts
    IMilestoneTracker public milestoneTracker;
    ISparkMinter public sparkMinter;

    // Link ID
    uint256 public linkIdCounter;

    // InviteLinks
    mapping(uint256 => InviteLink) public inviteLinks;

    // Link Admins
    mapping(address => bool) public linkAdmins;

    // User referrers
    mapping(address => address) public referrers;

    // Unlocked rewards by referrers
    mapping(address => uint256) public unlockedRewards;

    /// @notice A struct that represents a link redeem request.
    /// @param linkId The ID of the link to redeem.
    /// @param recipient The recipient of the sparks.
    /// @param sparks The amount of sparks to send.
    /// @param uid A unique ID that identifies the request.
    struct RedeemRequest {
        uint256 linkId;
        address recipient;
        uint256 sparks;
        bytes32 uid;
    }

    // @notice A struct that represents an invite link.
    // @param referrer The address of the referrer.
    // @param sparks The amount of sparks to send.
    // @param publicKey The public key of the link.
    struct InviteLink {
        address referrer;
        uint256 sparks;
        address publicKey;
    }

    // Error objects
    error InvalidAddress(address addr);
    error InvalidOrigin();
    error UnauthorizedLinkAdmin(address creator);
    error Unauthorized(address caller);
    error InvalidRecipient(address recipient);
    error InvalidSignature();
    error InvalidLink(uint256 linkId);
    error InvalidSparksAmount();

    // Events
    event LinkCreated(
        uint256 id,
        address referrer,
        uint256 sparks,
        address publicKey,
        string tag
    );

    event LinkRedeemed(
        uint256 id,
        address referrer,
        address recipient,
        uint256 sparks
    );

    event LinkRevoked(uint256 id);

    event LinkKeyUpdated(uint256 id, address publicKey);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializes the contract, using OpenZeppelin's upgradeable contracts framework.
    /// @param _milestoneTracker The address of the milestone tracker contract.
    /// @param _sparksMinter The address of the contract that mints spark tokens.
    function initialize(
        address _milestoneTracker,
        address _sparksMinter
    ) public initializer {
        __Ownable_init();
        __EIP712_init("InviteLinks", "1");

        milestoneTracker = IMilestoneTracker(_milestoneTracker);
        sparkMinter = ISparkMinter(_sparksMinter);
    }

    /// @notice Modifier that checks only allowed link creators can call the function
    modifier onlyLinkAdmin() {
        address caller = _msgSender();
        if (!linkAdmins[caller]) {
            revert UnauthorizedLinkAdmin(caller);
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

    /// @notice Adds a link admin
    /// @dev Throws if not called by the owner or if the address is zero.
    /// @param admin Address of the allowed admin.
    function addLinkAdmin(
        address admin
    ) external onlyOwner nonZeroAddress(admin) {
        linkAdmins[admin] = true;
    }

    /// @notice Removes a link admin
    /// @dev Throws if not called by the owner or if the address is zero.
    /// @param admin Address of the allowed admin.
    function removeLinkAdmin(address admin) external onlyOwner {
        delete linkAdmins[admin];
    }

    /// @notice Creates a link
    /// @dev Throws if not called by an allowed link admin.
    /// @param referrer Address of the referrer.
    /// @param sparks Amount of sparks to be awarded.
    /// @param publicKey Public key of the link.
    function createLink(
        address referrer,
        uint256 sparks,
        address publicKey,
        string calldata tag
    )
        external
        override
        onlyLinkAdmin
        nonZeroAddress(referrer)
        nonZeroAddress(publicKey)
        returns (uint256)
    {
        if (sparks == 0) {
            revert InvalidSparksAmount();
        }

        // Create the link
        uint256 id = linkIdCounter + 1;
        inviteLinks[id] = InviteLink(referrer, sparks, publicKey);
        linkIdCounter = id;

        // Emit the event
        emit LinkCreated(id, referrer, sparks, publicKey, tag);
        return id;
    }

    /// @notice Revokes a link
    /// @dev Throws if not called by the link owner.
    /// @param id ID of the link to revoke.
    function revokeLink(uint256 id) external {
        // Check if the link belongs to the caller
        InviteLink memory link = inviteLinks[id];
        if (link.referrer != _msgSender()) {
            revert Unauthorized(link.referrer);
        }

        delete inviteLinks[id];

        // Mint the reserved sparks to the referrer
        sparkMinter.mint(link.referrer, link.sparks);

        emit LinkRevoked(id);
    }

    /// @notice Updates the public key of a link
    /// @dev Throws if not called by the link owner.
    /// @param id ID of the link to update.
    /// @param publicKey New public key.
    function updateLinkKey(uint256 id, address publicKey) external {
        // Check if the link belongs to the caller
        InviteLink memory link = inviteLinks[id];
        if (link.referrer != _msgSender()) {
            revert Unauthorized(link.referrer);
        }

        inviteLinks[id].publicKey = publicKey;
        emit LinkKeyUpdated(id, publicKey);
    }

    /// @notice Redeems a link
    /// @dev Throws if not called by the link owner.
    /// @param request Redeem request.
    /// @param signature Signature of the request.
    function redeemLink(
        RedeemRequest calldata request,
        bytes calldata signature
    ) external onlyEOA {
        uint256 linkId = request.linkId;

        // Check if the link exists
        InviteLink memory link = inviteLinks[linkId];
        if (link.referrer == address(0)) {
            revert InvalidLink(linkId);
        }

        // Check the recipient is the caller and the referrer is not the recipient
        if (
            request.recipient != _msgSender() ||
            link.referrer == request.recipient
        ) {
            revert InvalidRecipient(request.recipient);
        }

        // Check if the signature is valid
        address signer = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    REDEEM_REQUEST_TYPE_HASH,
                    request.linkId,
                    request.recipient,
                    request.sparks,
                    request.uid
                )
            )
        ).recover(signature);

        if (signer != link.publicKey || request.sparks != link.sparks) {
            revert InvalidSignature();
        }

        // Delete the link
        delete inviteLinks[linkId];

        // Assign the referrer
        if (
            referrers[request.recipient] == address(0) &&
            link.referrer != request.recipient
        ) {
            referrers[request.recipient] = link.referrer;
        }

        // Award the sparks
        sparkMinter.award(link.referrer, link.sparks, request.recipient);

        // Emit the event
        emit LinkRedeemed(
            linkId,
            link.referrer,
            request.recipient,
            link.sparks
        );
    }

    /// @notice Awards sparks to a referrer because a user unlocked a milestone
    /// @param achiever Address of the achiever who reached the milestone.
    function awardMilestonesUnlocked(address achiever) external override {
        address referrer = referrers[achiever];
        uint256 lastMilestoneUnlocked = milestoneTracker.lastMilestoneUnlocked(
            achiever
        );

        // Only award up to the 6th milestone
        if (lastMilestoneUnlocked > 8) {
            return;
        }
        uint256 sparksReward = 0;
        uint256 unlocked = unlockedRewards[achiever];

        for (uint256 i = 0; i < lastMilestoneUnlocked; ) {
            // Values wont overflow because the max milestone is 8
            unchecked {
                // Check if the milestone is already unlocked
                uint256 check = 1 << i;
                if (unlocked & check == 0) {
                    unlocked |= check;
                    sparksReward += 10 ** i;
                }
                i++;
            }
        }

        unlockedRewards[achiever] = unlocked;

        // Mint the sparks
        if (sparksReward > 0) {
            // Award the referrer only if present
            if (referrer != address(0)) {
                sparkMinter.mint(referrer, sparksReward);
            }
            sparkMinter.mint(achiever, sparksReward);
        }
    }
}
