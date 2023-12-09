// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {ERC1155, ERC1155Burnable} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";

contract ERC1155Mock is ERC1155Burnable {
    constructor() ERC1155("") {
        // solhint-disable-previous-line no-empty-blocks
    }

    function mint(address account, uint256 tokenId) external {
        _mint(account, tokenId, 1, "");
    }
}
