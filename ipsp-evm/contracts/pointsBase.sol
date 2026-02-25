// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Define the interface for Immutable Points
interface IImmutablePoints {
    function getPointsBalance(address account) external view returns (uint256);
}

// Define the interface for Activation Functions
interface IActivationFunction {
    function activate() external returns (bool);
}

// Immutable Points Base Contract
contract ImmutablePointsBase is IImmutablePoints {
    mapping(address => uint256) private _pointsBalances;
    mapping(uint256 => address) public activationFunctions; // Mapping of activation function IDs to contract addresses
    address public owner;

    function initializeOwner() public {
        require(owner == address(0), "Already initialized");
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function getPointsBalance(
        address account
    ) public view override returns (uint256) {
        return _pointsBalances[account];
    }

    function registerActivationFunction(
        uint256 id,
        address activationFunctionAddress
    ) public onlyOwner {
        require(activationFunctionAddress != address(0), "Invalid address");
        activationFunctions[id] = activationFunctionAddress;
    }

    function getRegisteredActivationFunction(
        uint256 id
    ) public view returns (address) {
        return activationFunctions[id];
    }

    function issuePointsWithActivation(
        uint256 activationFunctionId,
        address recipient,
        uint256 amount
    ) internal {
        require(
            activationFunctions[activationFunctionId] != address(0),
            "Activation function not registered"
        );
        IActivationFunction activationFunction = IActivationFunction(
            activationFunctions[activationFunctionId]
        );
        require(activationFunction.activate(), "Activation function failed");
        _pointsBalances[recipient] += amount;
        // Additional logic such as emitting events
    }
}

// Custom Immutable Points Contract - Non-tradable ERC-20
contract CustomImmutablePoints is ImmutablePointsBase {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 private _totalSupply;

    // Initializer function to set name, symbol, and decimals
    function initialize(
        string memory _name,
        string memory _symbol,
        uint8 _decimals
    ) public {
        require(bytes(name).length == 0 && bytes(symbol).length == 0, "Already initialized");
        initializeOwner();  // Call the initializeOwner function from the base contract
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }

    // ERC-20: totalSupply function
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    // ERC-20: balanceOf function
    function balanceOf(address account) public view returns (uint256) {
        return getPointsBalance(account);
    }

    // Disable ERC-20 transfer function
    function transfer(address, uint256) public pure returns (bool) {
        revert("Non-tradable token: transfer not allowed");
    }

    // Disable ERC-20 transferFrom function
    function transferFrom(
        address,
        address,
        uint256
    ) public pure returns (bool) {
        revert("Non-tradable token: transfer not allowed");
    }

    // Disable ERC-20 approve function
    function approve(address, uint256) public pure returns (bool) {
        revert("Non-tradable token: approve not allowed");
    }

    // Disable ERC-20 allowance function
    function allowance(
        address,
        address
    ) public pure returns (uint256) {
        return 0;
    }

    // Custom function to trigger points issuance with activation function
    function triggerPointsIssuance(
        uint256 activationFunctionId,
        address recipient,
        uint256 amount
    ) public {
        // Custom logic before issuing points
        issuePointsWithActivation(activationFunctionId, recipient, amount);
        _totalSupply += amount;
        emit Transfer(address(0), recipient, amount);
        // Additional custom logic after issuing points
    }

    // Events for ERC-20 compliance (only Transfer from address(0) for issuance)
    event Transfer(address indexed from, address indexed to, uint256 value);
}
