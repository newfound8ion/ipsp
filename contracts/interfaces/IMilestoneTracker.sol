// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

interface IMilestoneTracker {
    function lastMilestoneUnlocked(address account) external returns (uint256);
}
