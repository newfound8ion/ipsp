// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

interface IEnergyMinter {
    function mint(address account, uint8 id, uint256 amount) external;

    function balanceOfEnergy(
        address account,
        uint8 id
    ) external view returns (uint256);
}
