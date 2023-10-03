// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "./mocks/EnergyMinterMock.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/// @dev Interface for the activationFunction activation function.
interface IActivationFunctionSync {
    function activate() external view returns (bool);
}

interface IActivationFunctionAsync {
    function activate(uint256 activationFunctionId) external;
}


/// @title NewcoinEncoder
/// @notice The handler contract that is authorized to mint NeuralTokens and Watts by registering approved ValidationFunctions.
contract NewcoinEncoder is Initializable, OwnableUpgradeable {


    /// @dev Enum to represent the type of Watt.
    enum WattType { NONE, CWATT, XWATT, LWATT, NWATT, PWATT, SWATT, VWATT }

    /// @dev Struct to represent an activationFunction.
    struct ActivationFunction {
        address issuer; // Developer who created this activationFunction
        bool approved; // Whether the activationFunction is approved by the contract owner
        WattType wattType; // EnergyConstants
        uint256 multiplier; // Multiplier value
        bytes32 contextId; // Unique generated ID
        string context; // Context string
        address addrss; // ENS or address
        uint256 weightInWatt; // Amount of watts to be issued
        bool isAsync; // Is the activationFunction asynchronous
    }

    /// @dev Event emitted when an address is debugged.
    event DebugAddress(address addr);

    /// @dev Array to store all activationFunctions.
    ActivationFunction[] public activationFunctions;

    /// @dev TEMP Instance of the EnergyMinterMock contract to be switched with the live contract.
    EnergyMinterMock public poC;

    /// @dev Event emitted when a new activationFunction is registered.
    event ActivationFunctionRegistered(uint256 activationFunctionId, address developer, string context);

    /// @dev Event emitted when an activationFunction is approved.
    event ActivationFunctionApproved(uint256 activationFunctionId);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @dev Contract constructor that sets the owner and the EnergyMinterMock instance.
    /// @param _poC Address of the EnergyMinterMock contract.
    function initialize(address _poC) public initializer {
      __Ownable_init();
        poC = EnergyMinterMock(_poC);
    }

    /// @dev Function for developers to register a new activationFunction.
    /// @param _wattType The type of Watt - EnergyConstants
    /// @param _multiplier The multiplier value.
    /// @param _contextId The unique generated ID.
    /// @param _context The context string.
    /// @param _addrss The ENS or address.
    /// @param _weightInWatt The amount of watts the issuer has.
    /// @return The ID of the registered activationFunction.
    function registerActivationFunction(
        WattType _wattType,
        uint256 _multiplier,
        bytes32 _contextId,
        string memory _context,
        address _addrss,
        uint256 _weightInWatt,
        bool _isAsync
    ) external returns (uint256) {

        require(_wattType != WattType.NONE, "Invalid watt type");

        ActivationFunction memory newActivationFunction = ActivationFunction({
            issuer: msg.sender,
            approved: false,
            wattType: _wattType,
            multiplier: _multiplier,
            contextId: _contextId,
            context: _context,
            addrss: _addrss,
            weightInWatt: _weightInWatt,
            isAsync: _isAsync
        });

        activationFunctions.push(newActivationFunction);
        emit ActivationFunctionRegistered(activationFunctions.length - 1, msg.sender, _context);
        return activationFunctions.length - 1;
    }

    /// @dev Function for the contract owner to approve an activationFunction for a specific badge ID.
    /// @param activationFunctionId The ID of the activationFunction to approve.
    function approveActivationFunction(uint256 activationFunctionId) external onlyOwner {
        require(activationFunctionId < activationFunctions.length, "Invalid activationFunction ID");
        activationFunctions[activationFunctionId].approved = true;
        emit ActivationFunctionApproved(activationFunctionId);
    }

    /// @dev Function to check if a badge can be minted based on its activationFunction.
    /// @param activationFunctionId The ID of the activationFunction to check.
    /// @return True if the activationFunction is approved, false otherwise.
    function canMint(uint256 activationFunctionId) external view returns (bool) {
        return activationFunctions[activationFunctionId].approved;
    }

    /// @dev Function to mint EnergyMinterMock tokens when an activationFunction is met.
    /// @param activationFunctionId The ID of the activationFunction to mint tokens for.
    function activate(uint256 activationFunctionId) external {
        require(activationFunctions[activationFunctionId].approved, "activationFunction not approved");
        emit DebugAddress(activationFunctions[activationFunctionId].addrss);


        if (activationFunctions[activationFunctionId].isAsync) {
            IActivationFunctionAsync af = IActivationFunctionAsync(activationFunctions[activationFunctionId].addrss);
            af.activate(activationFunctionId);
        } else {
            IActivationFunctionSync af = IActivationFunctionSync(activationFunctions[activationFunctionId].addrss);
            af.activate();
            require(af.activate(), "ActivationFunction condition not met");
            uint256 amountToMint = activationFunctions[activationFunctionId].weightInWatt * activationFunctions[activationFunctionId].multiplier;
            uint8 mintId = uint8(activationFunctions[activationFunctionId].wattType);
            poC.mint(tx.origin, mintId, amountToMint);
        }
    }

    /// @dev Callback function to mint tokens from asynchronous oracle response.
    /// @param conditionMet bool for the condition being met 
    /// @param activationFunctionId the stored id in the ActivationFunction id to register correctly here.
    function oracleResponse(bool conditionMet, uint256 activationFunctionId) external {
        if (conditionMet) {
            uint256 amountToMint = activationFunctions[activationFunctionId].weightInWatt * activationFunctions[activationFunctionId].multiplier;
            uint8 mintId = uint8(activationFunctions[activationFunctionId].wattType);
            poC.mint(tx.origin, mintId, amountToMint);
        }
    }
}

