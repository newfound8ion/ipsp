// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {IEnergyMinter} from "../interfaces/IEnergyMinter.sol";

contract EnergyMinterMock is IEnergyMinter {
    mapping(address => mapping(uint8 => uint256)) public balances;

    function mint(address account, uint8 id, uint256 amount) external override {
        balances[account][id] += amount;
    }

    function balanceOfEnergy(
        address account,
        uint8 id
    ) external view override returns (uint256) {
        return balances[account][id];
    }
}
