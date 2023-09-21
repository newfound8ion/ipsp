# Proof of Creativity

![build status](https://github.com/neftyblocks/safe-energy-contracts/actions/workflows/ci.yml/badge.svg)
![slither status](https://github.com/neftyblocks/safe-energy-contracts/actions/workflows/slither.yml/badge.svg)

This is a set of contracts for the Proof of Creativity!

## Contributing ActivationFunctions

Expand the functionality of the Proof of Creativity contracts by contributing new ActivationFunctions. Here's a step-by-step guide:

### Contribution Flow:

1. **Develop Your ActivationFunction Contract**: Create a smart contract that includes the required `activate()` function and your specified conditions.
2. **Deploy Your Contract**: Deploy your ActivationFunction contract to the desired network. Note down the deployed contract address. We are starting with Avalanche but we look to deploy on Arbitrum's Orbit L3 and Optimism's Superchain L3 soon.
3. **Submit for Approval**:
   - Provide the deployed contract address to the encoder for review.
   - Upon review, if your ActivationFunction meets the necessary criteria, it will be approved for integration. This is a centralised process whilst in beta and will look to decentralise this process soon via DAO approval.
4. **Receive an ID**: Once approved, the encoder will assign a unique ID to your ActivationFunction.
5. **Integration with the Encoder**:
   - Users will interact with the encoder's `activate` function.
   - They will provide the unique ID of the ActivationFunction they wish to use.
   - The encoder will internally call the `activate()` function of your ActivationFunction using the provided ID, checking the specified conditions.
6. **Minting Tokens**:
   - If the conditions in the `activate()` function are met, the encoder will mint tokens (via the ProofOfCreativity contract) for the submitting user.

### Requirements:

1. **activate() Function**: Your ActivationFunction contract must have an `activate()` function. This function is responsible for executing the conditions and will be called internally by the Encoder.
2. **Conditions**: Define conditions within your `activate()` function. Examples could include:
   - Checking if votes have passed on a DAO.
   - Verifying that someone holds an NFT from a specific collection.
   - Using off-chain based oracle data, such as social media following.
3. **Submission**: The scope for submission is the below type:

```solidity
    /// @dev Function for developers to register a new activationFunction.
    /// @param _wattType The type of Watt (SWATT or CWATT).
    /// @param _multiplier The multiplier value.
    /// @param _contextId The unique generated ID.
    /// @param _context The context string.
    /// @param _addrss The ENS or address of the Activation Function
    /// @param _weightInWatt The amount of watts the issuer has.
	    /// @return The ID of the registered activationFunction.
    function registerActivationFunction(
        WattType _wattType,
        uint256 _multiplier,
        bytes32 _contextId,
        string memory _context,
        address _addrss,
        uint256 _weightInWatt
    ) external returns (uint256) {

```

Any question contact via Telegram:
@lukeannison

## Running These Contracts

### General hardhat commands:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
npx hardhat help
REPORT_GAS=true npx hardhat test
npx hardhat coverage
npx hardhat run
```

### Linting

```shell
npx eslint '**/*.js'
npx eslint '**/*.js' --fix
npx prettier '**/*.{json,sol,md}' --check
npx prettier '**/*.{json,sol,md}' --write
npx solhint 'contracts/**/*.sol'
npx solhint 'contracts/**/*.sol' --fix
```

## Etherscan verification

To try out Etherscan verification, first the contract needs to be deployed and the ETHERSCAN_API_KEY has to be set in the env variables.

After the contract is deployed run the verify script. Replace `CONTRACT_ADDRESS` in this command:

```shell
yarn verify CONTRACT_ADDRESS
```

## Energy ids:

CWATT = 1
XWATT = 2
LWATT = 3
NWATT = 4
PWATT = 5
SWATT = 6
VWATT = 7

## External badges

To add new external badges modify the `./scripts/configure-external-badges.js` and run it with the correct network.

```
yarn hardhat run ./scripts/configure-external-badges.js
```

### Twitter energy

id: twitter
idHash: e0c21cec0df89042d0481b515470acf4b93b792ca3f63efbc999f5bb9716a8f4
multiplier: 100000
energy: NWATT

### Gitcoin

id: gitcoin
idHash: 0xe0c21cec0df89042d0481b515470acf4b93b792ca3f63efbc999f5bb9716a8f4
multiplier: 100
energy: VWATT

### Twitter verification

id: twitterVerification
idHash: 0x8cee25e7a470639dd169ebc8260328143d5f91dac1c011284fd50f2ec240ad98
multiplier: 1
energy: VWATT

### Twitter blue

id: twitterBlue
idHash: 0x78ac74102c501c50d4ec2b498ab65fa0aedc3ac745dc6171d4c069c271126a96
multiplier: 1
energy: VWATT

### Twitter followers

id: twitterFollowers
idHash: 0xb721b99bf249c07883e8ba2677a2f38bb84eb42b58ca6f64170935177cd8ada7
multiplier: 1
energy: NWATT
