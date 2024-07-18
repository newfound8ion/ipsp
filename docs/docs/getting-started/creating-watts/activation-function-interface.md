# Activation Functions Interface

### Overview

The activation function serves as the primary mechanism to activate the Newcoin system.

In this walkthrough we are going to create an activation function that is a simple vote mechanism. If enough votes have been passed then the caller on the check will gain WATTS.

### Interface Declaration:

Begin by declaring the interface for the activation function. This function is used by the Encoder internally to trigger the activation function conditions.

```solidity
interface IActivationFunction {
    function activate() external view returns (bool);
}
```

### Contract Implementation

Implement the `IActivationFunction` interface in your contract. For our voting example, we have the `SimpleVoteActivationFunction` contract:

```solidity
contract SimpleVoteActivationFunction is IActivationFunction {
    ...
}
```
