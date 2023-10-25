//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

interface IActivationFunctionAsync {
    function activate(uint256 _activationFunctionId) external;
}

interface ICallback {
    function oracleResponse(bool success, uint256 activationFunctionId) external;
}


contract GuildPassport is IActivationFunctionAsync, ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    address private oracleAddress;
    bytes32 private jobId;
    uint256 private fee;
    address private callback;
    uint256 private activationFunctionId;

    mapping(address => bool) public passportHolders;
    mapping(bytes32 => address) public requesters;
    
    constructor() ConfirmedOwner(msg.sender) {
        setChainlinkToken(0x779877A7B0D9E8603169DdbD7836e478b4624789);
        setOracleAddress(0x0FaCf846af22BCE1C7f88D1d55A038F27747eD2B);
        setJobId("43309009a154495cb2ed794233e6ff56");
        setFeeInHundredthsOfLink(0);     // 0 LINK
    }

    // Send a request to the Chainlink oracle
    function request() public {
    
        Chainlink.Request memory req = buildOperatorRequest(jobId, this.fulfill.selector);
                
        // DEFINE THE REQUEST PARAMETERS
        req.add('method', 'GET');
        req.add('url', 'https://api.guild.xyz/v2/guilds/2893/members/0x9F09de58B6EC16F8Eaf339e854BBE19672180cD0');
        req.add('headers', '["content-type", "application/json", "set-cookie", "sid=14A52"]');
        req.add('body', '');
        req.add('contact', 'derek_linkwellnodes.io');
                
                
        // PROCESS THE RESULT
        req.add('path', '0,access'); 

        bytes32 requestId = sendOperatorRequest(req, fee);
        requesters[requestId] = msg.sender;
    }

    bool public response;

    // Receive the result from the Chainlink oracle
    event RequestFulfilled(address indexed requester);
    function fulfill(bytes32 requestId, bool data) public recordChainlinkFulfillment(requestId) {
    	// Process the oracle response
        // emit RequestFulfilled(requestId);    // (optional) emits this event in the on-chain transaction logs, allowing Web3 applications to listen for this transaction
        response = data;     // example value: true

        address userAddress = requesters[requestId];
        require(userAddress != address(0), "Request ID not found");
        passportHolders[userAddress] = data;
        // Optionally, clean up the requester mapping to free up gas, if you won't need it again
        delete requesters[requestId];
    }
    // Update oracle address
    function setOracleAddress(address _oracleAddress) public onlyOwner {
        oracleAddress = _oracleAddress;
        setChainlinkOracle(_oracleAddress);
    }
    function getOracleAddress() public view onlyOwner returns (address) {
        return oracleAddress;
    }

    // Update jobId
    function setJobId(string memory _jobId) public onlyOwner {
        jobId = bytes32(bytes(_jobId));
    }
    function getJobId() public view onlyOwner returns (string memory) {
        return string(abi.encodePacked(jobId));
    }
    
    // Update fees`
    function setFeeInJuels(uint256 _feeInJuels) public onlyOwner {
        fee = _feeInJuels;
    }
    function setFeeInHundredthsOfLink(uint256 _feeInHundredthsOfLink) public onlyOwner {
        setFeeInJuels((_feeInHundredthsOfLink * LINK_DIVISIBILITY) / 100);
    }
    function getFeeInHundredthsOfLink() public view onlyOwner returns (uint256) {
        return (fee * 100) / LINK_DIVISIBILITY;
    }

    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            "Unable to transfer"
        );
    }

    function activate(uint256 _activationFunctionId) external {
        require(passportHolders[msg.sender], "Not a guild member and passport holder");
        ICallback(msg.sender).oracleResponse(true, _activationFunctionId);
    }
}
