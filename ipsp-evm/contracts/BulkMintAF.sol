pragma solidity ^0.8.19;

interface IActivationFunction {
    function activate() external view returns (bool);
}

contract AddressListActivationFunction is IActivationFunction {
    mapping(address => bool) public isAddressApproved;

    // Function to approve an array of addresses
    function approveAddresses(address[] calldata addresses) external {
        for (uint i = 0; i < addresses.length; i++) {
            isAddressApproved[addresses[i]] = true;
        }
    }

    // Activation function checks if the caller's address is approved
    function activate() external view override returns (bool) {
        return isAddressApproved[msg.sender];
    }
}
