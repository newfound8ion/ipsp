# Step 1: Stubbing the Contract

## A. Define the Activation Function Interface

Newcoin's encoder communicates with activation functions using a predefined interface. The activation function checks certain conditions and informs the encoder if they are satisfied.

The encoder holds two types of interfaces for us to inherit for our AFs. One for synchronous or one for asynchronous functions using Oracles.
We are going to use an oracle and therefore using the Asynchronous. For our example we will redefine the interface here:

IActivationFunctionAsync:

```solidity
interface IActivationFunctionAsync {
    function activate(uint256 _activationFunctionId) external;
}
```

- activate: This function will be called by the encoder. It needs to check the condition (e.g., Guild membership) and notify the encoder of the outcome.
  The \_activationFunctionId is what we will get when we successfully register the function with the Encoder and will be passed from the encoder to the activate function internally

## B. Contract Setup & Variable Declarations

Now, let’s stub out the GuildPassport contract which implements IActivationFunctionAsync and uses Chainlink to query Guild.xyz's API:

```solidity
contract GuildPassport is IActivationFunctionAsync, ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    address private oracleAddress;
    bytes32 private jobId;
    uint256 private fee;
    address private callback;
    uint256 private activationFunctionId;

    mapping(address => bool) public passportHolders;
    mapping(address => uint256) public pendingActivations;

    constructor() ConfirmedOwner(msg.sender) {
        setChainlinkToken(0x779877A7B0D9E8603169DdbD7836e478b4624789);
        setOracleAddress(0x0FaCf846af22BCE1C7f88D1d55A038F27747eD2B);
        setJobId("43309009a154495cb2ed794233e6ff56");
        setFeeInHundredthsOfLink(0);     // 0 LINK
    }

}
```

- ChainlinkClient and ConfirmedOwner are inherited from Chainlink contracts and help in interacting with Chainlink oracles and confirming contract ownership, respectively.
- passportHolders: A mapping to track addresses that have already minted WATTs (to avoid double minting).
- pendingActivations: A mapping for pending activations for reference for current pending oracle requests
- oracleAddress, jobId, and fee are specific to the Chainlink setup and need to be configured based on your Chainlink node and job.
- callback will store the address of the contract which will be notified once the condition check is complete.
- activationFunctionId helps identify which activation function is being processed.
- The Oracle Address is the oracle we can use for the chain we are based on. This address is for Eth Sepolia
- The Job id is for the type of data we need back. This job id is associted with a bool, which we need for this case

## Conclusion of Step 1:

- We've defined the interface (IActivationFunctionAsync) to structure communication between the encoder, activation function, and any callbacks.
- We've stubbed out the GuildPassport contract, which checks Guild membership using Chainlink to query Guild.xyz’s API.
- The constructor initializes the contract with Chainlink parameters.

In the next steps, we’ll dive into implementing the logic of sending a request to Guild.xyz via Chainlink and handling the response to communicate back to the encoder. This will encapsulate validating if the condition of the activation function is met and interacting with Newcoin's Encoder to mint WATTs when appropriate.
