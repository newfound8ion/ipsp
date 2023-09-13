// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

interface ISparkMinter {
    function mint(address account, uint256 amount) external;

    function award(address account, uint256 amount, address recipient) external;
}
