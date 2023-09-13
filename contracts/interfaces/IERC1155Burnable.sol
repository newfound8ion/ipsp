// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {IERC1155Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155Upgradeable.sol";

interface IERC1155Burnable is IERC1155Upgradeable {
    function burn(address account, uint256 id, uint256 value) external;
}
