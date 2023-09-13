// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {EIP712Upgradeable, ECDSAUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/// @title Profile
/// @notice A contract that will store the profile of a user.
contract Profile is Initializable, EIP712Upgradeable, OwnableUpgradeable {
    using ECDSAUpgradeable for bytes32;

    bytes32 public constant TWITTER_HANDLE = keccak256("twitterHandle");

    /// @notice The assigned to an address
    mapping(bytes32 => address) public userNameAddresses;

    /// @notice The assigned to an address
    mapping(address => bytes32) public addressUsersNames;

    /// @notice Mapping of update requests already used.
    mapping(bytes32 => bool) public usedRequestIds;

    /// @notice Addresses that can sign update requests.
    mapping(address => bool) public authorizedSigners;

    bytes32 private constant SET_FIELD_TYPE_HASH =
        keccak256(
            "SetField(bytes32 key,string value,address owner,bytes32 uid)"
        );

    bytes32 private constant UPDATE_PROFILE_TYPE_HASH =
        keccak256("SetProfile(string cid,bytes32 uid)");

    error UserNameAlreadyTaken();
    error InvalidUserName();
    error InvalidSignature();
    error InvalidField();
    error RequestAlreadyUsed();

    /// @notice A struct to set a profile field
    /// @param key The key of the field to update.
    /// @param value The value of the field to update.
    /// @param uid A unique ID that identifies the request. Used to prevent replay attacks.
    struct SetField {
        bytes32 key;
        string value;
        address owner;
        bytes32 uid;
    }

    struct SetProfile {
        string cid;
        bytes32 uid;
    }

    event ProfileUpdated(
        address owner,
        bytes32[] keysSet,
        string[] valuesSet,
        bytes32[] keysRemoved
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializes the contract
    function initialize() public initializer {
        __Ownable_init();
        __EIP712_init("Profile", "1");
    }

    /// @notice Adds an address that can sign redeem requests.
    /// @param signer The address to add.
    function addAuthorizedSigner(address signer) external onlyOwner {
        authorizedSigners[signer] = true;
    }

    /// @notice Removes an address that can sign redeem requests.
    /// @param signer The address to remove.
    function removeAuthorizedSigner(address signer) external onlyOwner {
        delete authorizedSigners[signer];
    }

    /// @notice Redeems an external badge.
    /// @param sets The sets to make.
    /// @param removals The removals to make.
    /// @param setSignatures The signatures of the sets. Not all sets need to be signed.
    /// @dev emits ProfileUpdated
    function updateProfile(
        SetField[] calldata sets,
        bytes32[] calldata removals,
        bytes[] calldata setSignatures
    ) external {
        address owner = _msgSender();
        uint256 setsLength = sets.length;

        bytes32[] memory keysAdded = new bytes32[](setsLength);
        string[] memory valuesAdded = new string[](setsLength);

        // Set fields
        for (uint256 i = 0; i < setsLength; ) {
            bytes32 key = sets[i].key;
            string calldata value = sets[i].value;

            if (sets[i].owner != owner) revert InvalidField();

            if (key == TWITTER_HANDLE) {
                // Check signature for twitter handle
                address signer = _recoverSignerAddress(
                    sets[i],
                    setSignatures[i]
                );
                if (!authorizedSigners[signer]) revert InvalidSignature();

                // Check if username is not taken and is valid
                bytes32 valueHash = _checkUsername(value);

                // Release existing username
                delete userNameAddresses[addressUsersNames[owner]];

                // Register new username
                userNameAddresses[valueHash] = owner;
                addressUsersNames[owner] = valueHash;
            }
            keysAdded[i] = key;
            valuesAdded[i] = value;
            unchecked {
                i++;
            }
        }

        emit ProfileUpdated(owner, keysAdded, valuesAdded, removals);
    }

    function _checkUsername(
        string calldata userName
    ) internal view returns (bytes32 userNameHash) {
        userNameHash = keccak256(bytes(userName));

        address existingOwner = userNameAddresses[userNameHash];
        if (existingOwner != address(0)) {
            revert UserNameAlreadyTaken();
        }

        bytes memory userNameBytes = bytes(userName);
        uint256 byteLength = userNameBytes.length;

        if (byteLength < 3 || byteLength > 40) {
            revert InvalidUserName();
        }

        for (uint256 i = 0; i < byteLength; ) {
            bytes1 b = userNameBytes[i];
            // Only allow lowercase letters, numbers and underscore
            if ((b < 0x61 || b > 0x7A) && (b < 0x30 || b > 0x39) && b != 0x5F) {
                revert InvalidUserName();
            }
            unchecked {
                i++;
            }
        }
    }

    /// @dev Recovers the address of the signer of a set request.
    function _recoverSignerAddress(
        SetField calldata request,
        bytes calldata signature
    ) internal returns (address) {
        if (usedRequestIds[request.uid]) revert RequestAlreadyUsed();
        usedRequestIds[request.uid] = true;
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        SET_FIELD_TYPE_HASH,
                        request.key,
                        keccak256(bytes(request.value)),
                        request.owner,
                        request.uid
                    )
                )
            ).recover(signature);
    }
}
