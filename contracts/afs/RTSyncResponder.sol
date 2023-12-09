// SPDX-License-Ident
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract NTSyncResponder {
    address public authorizedAddress;

    constructor(address _authorizedAddress) {
        authorizedAddress = _authorizedAddress;
    }

    function activate(uint256 amountToMint) external view returns (uint256) {
        require(msg.sender == authorizedAddress, "Unauthorized address");
        return amountToMint;
    }

    function setAuthorizedAddress(address _newAuthorizedAddress) external {
        authorizedAddress = _newAuthorizedAddress;
    }
}
