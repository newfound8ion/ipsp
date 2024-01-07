// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Define the interface for Immutable Points
interface IImmutablePoints {
    function getPointsBalance(address account) external view returns (uint256);
}

// Define the interface for Activation Functions
interface IActivationFunction {
    function activate() external returns (bool);
}

// Immutable Points Base Contract
contract ImmutablePointsBase is IImmutablePoints {
    mapping(address => uint256) private _pointsBalances;
    mapping(uint256 => address) public activationFunctions; // Mapping of activation function IDs to contract addresses
    address owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function getPointsBalance(
        address account
    ) public view override returns (uint256) {
        return _pointsBalances[account];
    }

    function registerActivationFunction(
        uint256 id,
        address activationFunctionAddress
    ) public onlyOwner {
        require(activationFunctionAddress != address(0), "Invalid address");
        activationFunctions[id] = activationFunctionAddress;
    }

    function getRegisteredActivationFunction(
        uint256 id
    ) public view returns (address) {
        return activationFunctions[id];
    }

    function issuePointsWithActivation(
        uint256 activationFunctionId,
        address recipient,
        uint256 amount
    ) internal {
        require(
            activationFunctions[activationFunctionId] != address(0),
            "Activation function not registered"
        );
        IActivationFunction activationFunction = IActivationFunction(
            activationFunctions[activationFunctionId]
        );
        require(activationFunction.activate(), "Activation function failed");
        _pointsBalances[recipient] += amount;
        // Additional logic such as emitting events
    }
}

// Custom Immutable Points Contract
contract CustomImmutablePoints is ImmutablePointsBase {
    // Custom logic for specific triggers or additional features

    function triggerPointsIssuance(
        uint256 activationFunctionId,
        address recipient,
        uint256 amount
    ) public {
        // Custom logic before issuing points
        issuePointsWithActivation(activationFunctionId, recipient, amount);
        // Additional custom logic after issuing points
    }

    // Additional custom logic as required by specific projects
}
