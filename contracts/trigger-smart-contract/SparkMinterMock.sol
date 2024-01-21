// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {ISparkMinter} from "../interfaces/ISparkMinter.sol";

contract SparkMinterMock is ISparkMinter {
    mapping(address => uint256) public sparks;
    mapping(address => uint256) public awards;

    function mint(address account, uint256 amount) external override {
        sparks[account] += amount;
    }

    function award(
        address,
        uint256 amount,
        address recipient
    ) external override {
        awards[recipient] += amount;
    }
}
