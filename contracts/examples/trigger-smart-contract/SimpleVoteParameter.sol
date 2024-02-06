pragma solidity ^0.8.19;

interface IActivationFunction {
    function activate() external view returns (bool);
}

contract SimpleVoteActivationFunction is IActivationFunction {
    uint256 public votes;
    uint256 public requiredVotes;
    mapping(address => bool) public hasVoted;

    event Voted(address indexed voter);

    constructor(uint256 _requiredVotes) {
        requiredVotes = _requiredVotes;
    }

    function vote() external {
        votes++;
        hasVoted[msg.sender] = true;
        emit Voted(msg.sender);
    }

    function activate() external view override returns (bool) {
        return votes >= requiredVotes;
    }
}
