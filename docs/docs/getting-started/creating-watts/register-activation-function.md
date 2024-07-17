# Register Activation Function

## Overview

After you have deployed your activation function (how to deploy smart contracts is out of the scope of this tutorial) you will need to register it with the Newcoin Encoder to have it become a permissionless condition check that can contribute to WATTS.

To propose a new activation function, you need to specify the type of Neural Token and the desired amount. This proposal is then submitted to the Encoder using the `registerActivationFunction`.

1. **Determine WATT Type and Amount**:

   - Understand the type of Neural Token (WATT) you want to associate with the activation function.
   - Decide on the multiplier value and the amount of WATTs.

2. **Prepare Activation Function Details**:

   - Generate a unique context ID for your activation function.
   - Define the context, which is a descriptive string about the activation function's purpose or behavior.
   - Specify the ENS or address associated with the activation function.

3. **Call `registerActivationFunction`**: Utilize the `registerActivationFunction` to register your proposed activation function with the Encoder. Here's the function signature:

```solidity
function registerActivationFunction(
    WattType _wattType,
    uint256 _multiplier,
    string memory _context,
    address _addrss,
    uint256 _weightInWatt
) external returns (uint256);
```

- `_wattType`: Specifies the type of WATT. This is an enum `WattType` which can have values representing different types of WATTs or Neural Tokens.
- `_multiplier`: A numerical value that acts as a multiplier.
- `_context`: A descriptive string about the activation function.
- `_addrss`: The ENS or Ethereum address associated with this activation function.
- `_weightInWatt`: Specifies the amount of WATTs or the weight associated with the activation function.

4. **Receive Activation Function ID**: Upon successful registration, the function will return a unique ID for the registered activation function. Store this ID for future references, as it will be crucial for subsequent steps like activation or querying.
