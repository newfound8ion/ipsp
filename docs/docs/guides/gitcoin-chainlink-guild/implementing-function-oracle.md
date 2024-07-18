# Step 2: Implementing Activation Function and Oracle Request Logic

In this step, we'll outline how to implement the activation function and how to utilize Chainlink Oracles to perform an API request to Guild.xyz. The process includes sending a request, handling the response, and communicating back to the Encoder.

## A. Implementing the Activation Function

We implement the activate function, which triggers the API request and stores the callback information.

```solidity
function activate(uint256 _activationFunctionId) external {
    // Send the request to the Chainlink Oracle
    request();
    // Store the callback address for this requests
    callback = msg.sender;
    activationFunctionId = _activationFunctionId;
}
```

- request(): A function that triggers the API call (implementation details below).
- callback: Storing the address calling the activation function to communicate back once the API response is received.
- activationFunctionId: Storing the ID to communicate back to the callback which activation function’s condition was checked.

## B. Sending API Request using Chainlink

Now, let's create the request function to initiate an API call to Guild.xyz's API via Chainlink.

```solidity
function request() public {
    Chainlink.Request memory req = buildOperatorRequest(jobId, this.fulfill.selector);

    // Define request parameters
    string memory addressAsString = string(abi.encodePacked(msg.sender));
    string memory targetUrl = string(abi.encodePacked('https://api.guild.xyz/v1/guild/access/19282/', addressAsString));

    req.add('method', 'GET');
    req.add('url', targetUrl);
    req.add('headers', '["content-type", "application/json", "set-cookie", "sid=14A52"]');
    req.add('path', '0,access');

    // Send the request to the Chainlink oracle
    sendOperatorRequest(req, fee);
}
```

In this function:

- buildOperatorRequest: Chainlink function to construct a request.
- fulfill.selector: Points to the function that handles the API response.
- req.add: Adds parameters to configure the API request. We add the headers, url and get reqeust. We also add the path to get the access boolean for the guild we are after.
- sendOperatorRequest: Chainlink function to send the request to the Oracle.

## C. Handling the API Response

We need a function (fulfill) to handle the API response, check the returned data, and communicate back to the Encoder via the callback.

```solidity
// Event to log the oracle response
event RequestFulfilled(bytes32 indexed requestId);

function fulfill(bytes32 requestId, bool data) public recordChainlinkFulfillment(requestId) {
    emit RequestFulfilled(requestId);

    // Ensure the wallet can't trigger claiming WATTs for their token multiple times
    if (data && !passportHolders[msg.sender]) {
        passportHolders[msg.sender] = true;

        // Ensure the callback address is set before calling the function
        require(callback != address(0), "Callback address not set");
        ICallback(callback).oracleResponse(data, activationFunctionId);
    }
}
```

- recordChainlinkFulfillment: A modifier to ensure only the Oracle can call this function.
- emit RequestFulfilled(requestId): Logs the API response.
- passportHolders[msg.sender] = true: Flags the wallet as having satisfied the condition.
- ICallback(callback).oracleResponse(data, activationFunctionId): Calls back to inform whether the condition was satisfied.

## Conclusion of Step 2:

- We've implemented the activate function that triggers the Chainlink API request and stores callback details.
- We've outlined how to send an API request to Guild.xyz using Chainlink, specifying the API endpoint, method, and necessary headers.
- We've implemented the fulfill function to handle the API response, check the data, and communicate back to the Encoder.

In the next steps, we’ll work on setting up additional configuration options and other functionalities like withdrawing LINK from the contract, updating Chainlink parameters, and ensuring that the contract operates securely and efficiently. This aligns with Newcoin's philosophy of offering a decentralized, secure, and trustworthy mechanism to mint WATTs based on real-world, verifiable conditions.
