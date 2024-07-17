// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {ERC721, ERC721Burnable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

contract ERC721Mock is ERC721Burnable {
    constructor() ERC721("Mock Collection", "MCK") {
        // solhint-disable-previous-line no-empty-blocks
    }

    function mint(address account, uint256 tokenId) external {
        _mint(account, tokenId);
    }
}
