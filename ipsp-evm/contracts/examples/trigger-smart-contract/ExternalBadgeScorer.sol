// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {IEnergyMinter} from "./interfaces/IEnergyMinter.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {EIP712Upgradeable, ECDSAUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/// @title ExternalBadgeScorer
/// @notice A contract that allows users to redeem external badges by verifying a signature.
contract ExternalBadgeScorer is
    Initializable,
    EIP712Upgradeable,
    OwnableUpgradeable
{
    using ECDSAUpgradeable for bytes32;

    IEnergyMinter private energyMinter;

    /// @notice A mapping that keeps track of sources that can be redeemed.
    mapping(bytes32 => ExternalSource) public externalSources;

    /// @notice A mapping that keeps track of the redemptions for each source.
    mapping(bytes32 => mapping(bytes32 => bool)) public redeemedBadges;

    /// @notice A mapping that keeps track of addresses that can sign redeem requests per external source.
    mapping(bytes32 => mapping(address => bool)) public authorizedSigners;

    /// @notice A mapping that keeps track of the unique IDs of redeem requests already used.
    mapping(bytes32 => bool) public usedRequestIds;

    /// @notice A struct that represents an external source.
    /// @param energyId The energy ID that corresponds to this source.
    /// @param multiplier The multiplier that will be applied to the score.
    /// @param mode The mode of the source (To be used by external service).
    struct ExternalSource {
        uint8 energyId;
        uint32 multiplier;
        uint8 mode;
    }

    bytes32 private constant REDEEM_REQUEST_TYPE_HASH =
        keccak256(
            "RedeemRequest(address owner,bytes32 id,bytes32 externalSourceId,uint256 score,bytes32 uid)"
        );

    /// @notice A struct that represents an external ERC721 redeem request.
    /// @param owner The owner of the token.
    /// @param id The ID of the source to redeem.
    /// @param externalSourceId The id of the source to redeem.
    /// @param score The score to redeem.
    /// @param uid A unique ID that identifies the request. Used to prevent replay attacks.
    struct RedeemRequest {
        address owner;
        bytes32 id;
        bytes32 externalSourceId;
        uint256 score;
        bytes32 uid;
    }

    error DuplicateRequest();
    error AlreadyRedeemed();
    error InvalidSignature();
    error UnknownSource();

    /// @notice Emitted when a source is added.
    /// @param sourceId The ID of the source.
    /// @param energyId The energy ID that corresponds to this source.
    /// @param multiplier The multiplier that will be applied to the score.
    /// @param mode The mode of the source (To be used by external service).
    event ExternalSourceAdded(
        bytes32 sourceId,
        uint8 energyId,
        uint32 multiplier,
        uint8 mode
    );

    /// @notice Emitted when a source is removed.
    /// @param sourceId The ID of the source.
    event ExternalSourceRemoved(bytes32 sourceId);

    /// @notice Emitted when a badge is redeemed.
    /// @param sourceId The ID of the source.
    /// @param id The ID of the badge.
    /// @param owner The owner of the badge.
    /// @param score The score of the badge.
    /// @param energyId The energy ID that corresponds to this source.
    /// @param energyAmount The amount of energy that was minted.
    event BadgeRedeemed(
        bytes32 indexed sourceId,
        bytes32 id,
        address indexed owner,
        uint256 score,
        uint8 energyId,
        uint256 energyAmount
    );

    event BadgeCleared(bytes32 indexed sourceId, bytes32 id);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializes the contract with the EnergyMinter contract.
    /// @param _energyMinter The address of the contract that mints energy tokens.
    function initialize(address _energyMinter) public initializer {
        __Ownable_init();
        __EIP712_init("ExternalBadgeScorer", "1");

        energyMinter = IEnergyMinter(_energyMinter);
    }

    /// @notice Sets a source that can be redeemed.
    /// @param sourceId The ID of the source to add.
    /// @param energyId The energy ID that corresponds to this source.
    /// @param multiplier The multiplier that will be applied to the score.
    /// @param mode The mode of the source (To be used by external service).
    /// @dev emits ExternalSourceAdded
    function setExternalSource(
        bytes32 sourceId,
        uint8 energyId,
        uint32 multiplier,
        uint8 mode
    ) external onlyOwner {
        externalSources[sourceId].energyId = energyId;
        externalSources[sourceId].multiplier = multiplier;
        externalSources[sourceId].mode = mode;

        emit ExternalSourceAdded(sourceId, energyId, multiplier, mode);
    }

    /// @notice Removes a source that can be redeemed.
    /// @param sourceId The ID of the source to remove.
    /// @dev emits ExternalSourceRemoved
    function removeExternalSource(bytes32 sourceId) external onlyOwner {
        delete externalSources[sourceId];

        emit ExternalSourceRemoved(sourceId);
    }

    // TODO: Remove this action
    function clearBadge(bytes32 sourceId, bytes32 id) external onlyOwner {
        delete redeemedBadges[sourceId][id];

        emit BadgeCleared(sourceId, id);
    }

    /// @notice Adds an address that can sign redeem requests.
    /// @param externalSourceId The ID of the source to add the signer to.
    /// @param signer The address to add.
    function addAuthorizedSigner(
        bytes32 externalSourceId,
        address signer
    ) external onlyOwner {
        authorizedSigners[externalSourceId][signer] = true;
    }

    /// @notice Removes an address that can sign redeem requests.
    /// @param externalSourceId The ID of the source to remove the signer from.
    /// @param signer The address to remove.
    function removeAuthorizedSigner(
        bytes32 externalSourceId,
        address signer
    ) external onlyOwner {
        delete authorizedSigners[externalSourceId][signer];
    }

    /// @notice Redeems an external badge.
    /// @param request The redeem request.
    /// @param signature The signature of the request.
    /// @dev emits Redeemed
    function redeem(
        RedeemRequest calldata request,
        bytes calldata signature
    ) external {
        ExternalSource memory source = externalSources[
            request.externalSourceId
        ];
        if (source.energyId == 0) revert UnknownSource();

        address signer = _recoverRedeemerAddress(request, signature);
        if (
            usedRequestIds[request.uid] ||
            !authorizedSigners[request.externalSourceId][signer]
        ) revert InvalidSignature();

        if (redeemedBadges[request.externalSourceId][request.id])
            revert AlreadyRedeemed();

        redeemedBadges[request.externalSourceId][request.id] = true;
        usedRequestIds[request.uid] = true;

        // Mint energy
        uint8 energyId = source.energyId;
        uint256 amount = request.score * uint256(source.multiplier);
        energyMinter.mint(request.owner, energyId, amount);

        emit BadgeRedeemed(
            request.externalSourceId,
            request.id,
            request.owner,
            request.score,
            energyId,
            amount
        );
    }

    /// @dev Recovers the address of the signer of a redeem request.
    function _recoverRedeemerAddress(
        RedeemRequest calldata request,
        bytes calldata signature
    ) internal view returns (address) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        REDEEM_REQUEST_TYPE_HASH,
                        request.owner,
                        request.id,
                        request.externalSourceId,
                        request.score,
                        request.uid
                    )
                )
            ).recover(signature);
    }
}
