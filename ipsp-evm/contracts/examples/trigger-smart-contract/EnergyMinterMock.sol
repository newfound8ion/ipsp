// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {IEnergyMinter} from "../interfaces/IEnergyMinter.sol";

contract EnergyMinterMock is IEnergyMinter {
    mapping(address => mapping(uint8 => uint256)) public balances;
    mapping(uint8 => uint256) public wattMultipliers; // Multipliers for NTs to Watts
    uint8 public constant WATT_ID = 0; // ID for Watts, set as constant

    // Constructor to set up multipliers for specific NTs
    constructor() {
        wattMultipliers[4] = 3; // NWATT: 3x
        wattMultipliers[5] = 5; // PWATT: 5x
        wattMultipliers[2] = 10; // XWATT: 10x
    }

    function mint(address account, uint8 id, uint256 amount) external override {
        balances[account][id] += amount;

        // If the NT type has a watt multiplier, mint corresponding Watts
        if (wattMultipliers[id] != 0) {
            uint256 wattAmount = amount * wattMultipliers[id];
            balances[account][WATT_ID] += wattAmount; // Minting Watts
        }
    }

    function balanceOfEnergy(
        address account,
        uint8 id
    ) external view override returns (uint256) {
        return balances[account][id];
    }

    // Function to get total Watts for an account
    function totalWatts(address account) external view returns (uint256) {
        return balances[account][WATT_ID];
    }
}
