// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Simplified ABI with only the function we need
interface VotingContract {
    function addressTotalVotesVerified() external view returns (bool);
}

contract VoteChecker {

    // Address of the contract you want to interact with
    address public votingContractAddress;

    constructor(address _votingContractAddress) {
        votingContractAddress = _votingContractAddress;
    }

    // Function to check if the address is verified for total votes
    function activate() public view returns (bool) {
        // Create an instance of the contract
        VotingContract votingContract = VotingContract(votingContractAddress);
        
        // Call the function and return the result
        return votingContract.addressTotalVotesVerified();
    }
}
