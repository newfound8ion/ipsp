// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {NTERC20} from "./extensions/NTERC20.sol";

/// @title Token
/// @notice The Token contract extends the NTERC20 contract, providing a customizable token that has a designated minter. Only the minter can mint and burn tokens.
/// @dev Inherits from the NTERC20 contract.
contract Token is NTERC20 {
    address public minter;

    error UnauthorizedMinter(address minter);

    /// @notice Constructs the Token contract with the given name, symbol, and minter address.
    /// @param _name The name of the token.
    /// @param _symbol The symbol of the token.
    /// @param _minter The address of the minter.
    constructor(
        string memory _name,
        string memory _symbol,
        address _minter
    ) NTERC20(_name, _symbol) {
        minter = _minter;
    }

    /// @notice Modifier that checks if the caller is the minter.
    modifier onlyMinter() {
        if (msg.sender != minter) revert UnauthorizedMinter(msg.sender);
        _;
    }

    /// @notice Mints the specified amount of tokens for the given account.
    /// @dev Can only be called by the minter.
    /// @param account The address of the account to mint tokens for.
    /// @param amount The amount of tokens to mint.
    function mint(address account, uint256 amount) external onlyMinter {
        _mint(account, amount);
    }

    /// @notice Burns the specified amount of tokens from the given account.
    /// @dev Can only be called by the minter.
    /// @param account The address of the account to burn tokens from.
    /// @param amount The amount of tokens to burn.
    function burn(address account, uint256 amount) external onlyMinter {
        _burn(account, amount);
    }
}
