// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract JokeVote {

    // Mapping to store votes of addresses
    mapping(address => bool) public hasVoted;
    
    // Event emitted when a vote is cast
    event VoteCast(address indexed voter);

    // Function to vote for a joke
    function castVote() external {
        // Ensure the address has not voted before
        require(!hasVoted[msg.sender], "Already voted");

        // Mark the address as having voted
        hasVoted[msg.sender] = true;

        // Emit the vote cast event
        emit VoteCast(msg.sender);
    }

    // Function to check if an address has verified votes
    function addressTotalVotesVerified(address _address) external view returns (bool) {
        // Return whether the address has voted
        return hasVoted[_address];

    }
}

