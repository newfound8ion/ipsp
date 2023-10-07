pragma solidity ^0.8.16;

contract JokeVote {

    // Mapping to store votes of addresses
    mapping(address => bool) public hasVoted;

    // Event emitted when a vote is cast
    event VoteCast(address indexed voter);

    // Proposal structure to store proposal data
    struct Proposal {
        address author;
        string description;
    }

    // Mapping to store proposals
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;

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
    function addressTotalVotesVerified() external view returns (bool) {
        // Return whether the address has voted
        return hasVoted[tx.origin];
    }

    // Function to create a new proposal
    function createProposal(string memory _description) external {
        proposals[proposalCount] = Proposal({
            author: msg.sender,
            description: _description
        });

        // Increment proposal count
        proposalCount++;
    }

    // Function to get a proposal
    function getProposal(uint256 _proposalId) external view returns (address, string memory) {
        Proposal memory proposal = proposals[_proposalId];
        return (proposal.author, proposal.description);
    }
}
