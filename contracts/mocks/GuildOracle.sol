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
    mapping(address => uint256) public pendingActivations; 
    
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
        string memory addressAsString = string(abi.encodePacked(msg.sender));
        string memory targetUrl = string(abi.encodePacked('https://api.guild.xyz/v1/guild/access/16389/', addressAsString));
        req.add('url', targetUrl);
        req.add('headers', '["content-type", "application/json", "set-cookie", "sid=14A52"]');
        req.add('body', '');
                
        // PROCESS THE RESULT
        req.add('path', '0,access'); 

        // Send the request to the Chainlink oracle        
        sendOperatorRequest(req, fee);
        
        // Store the pending activationFunctionId for this requester
        pendingActivations[msg.sender] = activationFunctionId;
    }

    bool public response;

    // Receive the result from the Chainlink oracle
    event RequestFulfilled(address indexed requester);
    function fulfill(bytes32 requestId, bool data) public recordChainlinkFulfillment(requestId) {
        passportHolders[msg.sender] = data;
        emit RequestFulfilled(msg.sender);
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
