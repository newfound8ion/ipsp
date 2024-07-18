# Activation Functions Logic

## Writing the Vote Contract

### Overview

For our activation function, we're utilizing a simple voting mechanism. Users will be able to cast their votes, and once a certain threshold of votes is reached, the activation function will return `true`. This signifies that the conditions for activation have been met.

Normally we would want our conditions to be a little more rhobust and connected to real world conditions that we can't game. But this will illistrate the approach until then.

### Contract Variables:

1. **votes**: A counter to keep track of the total votes cast.
2. **requiredVotes**: The threshold number of votes required for activation.
3. **hasVoted**: A mapping to track whether an address has already voted, ensuring one vote per address.

```solidity
uint256 public votes;
uint256 public requiredVotes;
mapping(address => bool) public hasVoted;
```

### Contract Initialization:

When deploying the contract, specify the number of votes required for the activation function to return true.

```solidity
constructor(uint256 _requiredVotes) {
    requiredVotes = _requiredVotes;
}
```

### Voting Mechanism:

Users can cast their vote using the vote function. Each vote increments the votes counter and registers the voter's address, ensuring that each address can only vote once.

```solidity
function vote() external {
    require(!hasVoted[msg.sender], "You have already voted.");

    votes++;
    hasVoted[msg.sender] = true;

    emit Voted(msg.sender);
}
```

### Activation Check:

The activate function checks if the number of votes meets or exceeds the required threshold.

```solidity
function activate() external view override returns (bool) {
    return votes >= requiredVotes;
}
```

### Events:

To track voting actions on the blockchain, an event is emitted every time a vote is cast.

```solidity
event Voted(address indexed voter);
```
