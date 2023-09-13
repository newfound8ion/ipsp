// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {IERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";

interface IERC721Burnable is IERC721Upgradeable {
    function burn(uint256 tokenId) external;
}
