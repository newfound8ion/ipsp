// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract CollectionPosition is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    address private oracleAddress;
    bytes32 private jobId;
    uint256 private fee;

    // Variables for the URL parameters
    string public collectionAddress;
    string public addressToCheck;
    string public tokenId;

    // Public variable to store the latest order
    uint256 public latestOrder;

    // Event to notify when the request is fulfilled
    event RequestFulfilled(bytes32 indexed requestId, uint256 indexed order);

    constructor() ConfirmedOwner(msg.sender) {
        setChainlinkToken(0x779877A7B0D9E8603169DdbD7836e478b4624789);
        setOracleAddress(0x0FaCf846af22BCE1C7f88D1d55A038F27747eD2B);
        setJobId("a8356f48569c434eaa4ac5fcb4db5cc0");
        setFeeInHundredthsOfLink(0); // 0 LINK
    }

    // Function to send a request to the Chainlink oracle
    function request(
        string memory _collectionAddress,
        string memory _addressToCheck,
        string memory _tokenId
    ) public {
        Chainlink.Request memory req = buildOperatorRequest(
            jobId,
            this.fulfill.selector
        );

        // Setting the new parameters
        collectionAddress = _collectionAddress;
        addressToCheck = _addressToCheck;
        tokenId = _tokenId;

        // Constructing the new URL
        string memory fullUrl = string(
            abi.encodePacked(
                "https://api.newgra.ph/v1/activation/token-holder-order/oracle?collectionAddress=",
                collectionAddress,
                "&addressToCheck=",
                addressToCheck,
                "&tokenId=",
                tokenId
            )
        );

        // Set the request parameters
        req.add("method", "GET");
        req.add("url", fullUrl);
        req.add("headers", "");
        req.add("contact", "");
        req.addInt("multiplier", 1);

        req.add("path", "");

        req.add("body", "");

        // Send the request
        sendOperatorRequest(req, fee);
    }

    // Function to receive the result from the Chainlink oracle
    function fulfill(
        bytes32 requestId,
        uint256 order
    ) public recordChainlinkFulfillment(requestId) {
        emit RequestFulfilled(requestId, order);
        latestOrder = order; // Store the order directly
    }

    // Function to update the oracle address
    function setOracleAddress(address _oracleAddress) public onlyOwner {
        oracleAddress = _oracleAddress;
        setChainlinkOracle(_oracleAddress);
    }

    // Function to set the jobId
    function setJobId(string memory _jobId) public onlyOwner {
        jobId = bytes32(bytes(_jobId));
    }

    // Function to set the fee in Juels
    function setFeeInJuels(uint256 _feeInJuels) public onlyOwner {
        fee = _feeInJuels;
    }

    // Helper functions for fee conversions
    function setFeeInHundredthsOfLink(
        uint256 _feeInHundredthsOfLink
    ) public onlyOwner {
        setFeeInJuels((_feeInHundredthsOfLink * LINK_DIVISIBILITY) / 100);
    }

    function getFeeInHundredthsOfLink()
        public
        view
        onlyOwner
        returns (uint256)
    {
        return (fee * 100) / LINK_DIVISIBILITY;
    }

    // Function to withdraw LINK tokens from the contract
    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            "Unable to transfer"
        );
    }
}
