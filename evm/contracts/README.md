# IPSP Onchain Points Solidity Contracts

## Overview
The `ImmutablePointsBase` contract serves as a foundational component for creating and managing on-chain points within the IPSP ecosystem. It is designed to be extended for custom implementations while providing core functionalities essential for point management and activation.

## Interfaces

### IImmutablePoints
This interface defines a single function `getPointsBalance`, which allows querying the points balance of a specified account.

```solidity
interface IImmutablePoints {
    function getPointsBalance(address account) external view returns (uint256);
}
```

### IActivationFunction
An interface for defining activation functions. The `activate` function should be implemented to perform custom logic for point activation.

```solidity
interface IActivationFunction {
    function activate() external returns (bool);
}
```

## ImmutablePointsBase Contract
The base contract for immutable points, implementing the `IImmutablePoints` interface.

### State Variables
- `_pointsBalances`: A private mapping storing the points balance of each address.
- `activationFunctions`: A public mapping linking activation function IDs to their contract addresses.
- `owner`: Stores the address of the contract owner.

### Constructor
Sets the contract deployer as the owner.

### Modifiers
- `onlyOwner`: Ensures that only the owner can call certain functions.

### Functions
- `getPointsBalance`: Returns the points balance of a given account.
- `registerActivationFunction`: Allows the owner to register activation functions.
- `getRegisteredActivationFunction`: Returns the address of a registered activation function.
- `issuePointsWithActivation`: An internal function to issue points, invoked by an activation function.

### Usage
This contract is used as a base for creating custom points contracts. It provides fundamental functionalities like points balance querying and management, as well as a mechanism for integrating activation functions.

## CustomImmutablePoints Contract
An example extension of the `ImmutablePointsBase` contract, illustrating how additional logic and features can be integrated.

### Functions
- `triggerPointsIssuance`: A public function to demonstrate how points can be issued with custom pre- and post-issuance logic.

### Customization
This contract can be customized to meet specific project requirements, such as integrating with external systems, adding new features, or modifying existing logic.
