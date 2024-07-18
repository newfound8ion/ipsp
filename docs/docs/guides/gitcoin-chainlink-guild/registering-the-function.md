# Step 4: Interacting with the Encoder and Activating the Function

Once the activation function has been implemented and deployed, the next step is to interact with the Newcoin Encoder to register and activate the function, thereby minting WATTs upon successful condition checks.

## A. Registering the Activation Function with the Encoder

Before an activation function can mint WATTs, it must be registered and approved by the Newcoin Encoder. This process involves providing details about the function and awaiting approval from the Newcoin Foundation.

```solidity
function registerActivationFunction(
    WattType _wattType,
    uint256 _multiplier,
    string memory _context,
    address _addrss,
    uint256 _weightInWatt,
    bool _isAsync
) external returns (uint256);
```

- \_wattType: Type of WATT to be minted.
- \_multiplier: Multiplier value to calculate the minted amount.
- \_context: A descriptive string explaining the activation function.
- \_addrss: Address of the activation function contract.
- \_weightInWatt: The amount of WATTs to be minted upon successful activation.
- \_isAsync: A boolean indicating if the activation function is asynchronous.

After registration, the function will return an ID that will be used to interact with the activation function in the future. Store this ID securely.

## B. Activation of the Function

Upon approval from the Newcoin Foundation, users can run the activation function to mint tokens. This involves calling the activate function on the Encoder, supplying the ID of the approved activation function.

### Activation Call:

We would then run the activate() function on the Encoder, passing it our activationFunctionId.

When a user calls the activate function with the appropriate activationFunctionId, the Encoder will interact with the specified activation function to check if conditions are met. Upon successful validation, WATTs are minted according to our predefined logic in the activation function - membership of the Guild and holders of the Gitcoin Passport.

## Conclusion of Step 4:

In this step, we've covered:

- How to register the activation function with the Encoder, providing relevant details and obtaining a unique ID.
- How to activate the function, interacting with the Encoder and triggering the logic to mint WATTs.

By effectively interacting with the Encoder, developers ensure that the activation functions can mint WATTs upon successfully validating predefined conditions, thereby contributing to the user’s algorithmic reputation within the Newcoin ecosystem. This seamless integration enables the efficient minting of WATTs, providing a tangible representation of real-world activities and verifications on the blockchain.
