// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface VotingContract {
    function addressTotalVotesVerified() external view returns (bool);
}

interface EnergyContract {
    function balanceOfEnergy(address account, uint8 id) external view returns (uint256);
}

contract JokeVoteChecker {

    address public votingContractAddress; // The address of the Jokerace contest contract
    address public energyContractAddress; // The address of the contract with Watts balance

    event Activated();
    
    mapping(address => bool) public hasChecked;

    uint256 public requiredWatts = 10; 
    
    constructor(address _votingContractAddress, address _energyContractAddress) {
        votingContractAddress = _votingContractAddress;
        energyContractAddress = _energyContractAddress;
    }

    function activate() public returns (bool) {
        // Revert if the sender has already checked
        require(!hasChecked[msg.sender], "Already checked");

        // Create an instance of the VotingContract
        VotingContract votingContract = VotingContract(votingContractAddress);
        // Revert if the sender has not voted
        require(votingContract.addressTotalVotesVerified(), "Has not voted");

        // Create an instance of the EnergyContract
        EnergyContract energyContract = EnergyContract(energyContractAddress);
        // Revert if the sender has insufficient Watts
        require(energyContract.balanceOfEnergy(msg.sender, 1) >= requiredWatts, "Insufficient Watts");
        
        // Update the state to reflect that the sender has checked
        hasChecked[msg.sender] = true;
        emit Activated();
    }
}
