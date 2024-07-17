### **Step 1: Setting Up the JokeVote Contract**

In the JokeVote contract, we will mock the jokerace contract to allow users to cast a vote for a joke and verify the total votes cast by the sender.

**A. Implementing Vote Casting**

We need a way for users to cast a vote. The `castVote` function allows an address to cast a vote if it has not done so before.

```solidity
function castVote() external {
    require(!hasVoted[msg.sender], "Already voted");
    hasVoted[msg.sender] = true;
    emit VoteCast(msg.sender);
}
```

**B. Implementing Vote Verification**

We also need a way to check if the sender has verified votes.

```solidity
function addressTotalVotesVerified() external view returns (bool) {
    return hasVoted[tx.origin];
}
```
