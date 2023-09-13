// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

interface ILinkCreator {
    function createLink(
        address referrer,
        uint256 sparks,
        address publicKey,
        string calldata createLink
    ) external returns (uint256);
}
