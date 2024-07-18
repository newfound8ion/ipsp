# User Runs Activate Function

## User Runs Activate Function on Encoder and Submits ID of Approved Activation Function

After the Newcoin Foundation approves an activation function, the next step is for the user to run this approved function on the encoder. The encoder, upon successful execution, will generate an ID for the approved activation function. This ID is then used to mint tokens in the system based on the conditions set in the activation function.

1. **Vote Using the Activation Function**:

   - To meet the condition of our example activation function, two votes need to be cast. Let's assume you've used the `SimpleVoteActivationFunction` to create a new voting contract that requires two votes for activation.
   - Cast your votes using the `vote()` method from the contract. Ensure this is done twice.

```solidity
SimpleVoteActivationFunction voteContract = SimpleVoteActivationFunction(<Contract_Address>);
voteContract.vote();  // Call this twice
```

- **Run the Activation Function on the Encoder**:
  - Once the votes are cast, ensure you have the ID of the activation function that was approved by the Newcoin Foundation. For this example, let's use an ID of `1`.
  - Use this ID to call the `activate` function on the Encoder.

```solidity
Encoder encoder = Encoder(<Encoder_Address>);
encoder.activate(1);
```

- **Check for Successful Execution**:
  - The encoder will validate that the provided activation function ID corresponds to an approved function.
  - If the conditions of the activation function are met (in this case, two votes were cast), the encoder will proceed to mint tokens based on the conditions specified in the activation function.
  - Monitor the `ActivationFunctionApproved` event for confirmation.
