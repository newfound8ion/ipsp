// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

contract Forwarder {
    function forwardCall(
        address target,
        bytes calldata data
    ) external payable returns (bool success, bytes memory result) {
        (success, result) = target.call{value: msg.value}(data);
        if (!success) {
            // Get the revert reason and bubble it up
            assembly {
                let returndata_size := mload(result)
                revert(add(32, result), returndata_size)
            }
        }
    }

    receive() external payable {
        revert("Cannot send ETH directly to this contract");
    }

    fallback() external payable {
        revert("Cannot send ETH directly to this contract");
    }
}
