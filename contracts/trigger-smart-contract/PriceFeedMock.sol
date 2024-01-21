// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract PriceFeedMock is AggregatorV3Interface {
    int256 private price;
    uint8 private priceDecimals;

    constructor(int256 _price, uint8 _decimals) {
        price = _price;
        priceDecimals = _decimals;
    }

    function decimals() external view override returns (uint8) {
        return priceDecimals;
    }

    function description() external pure override returns (string memory) {
        return "PriceFeedMock";
    }

    function version() external pure override returns (uint256) {
        return 1;
    }

    function getRoundData(
        uint80
    )
        external
        view
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (1, price, 1, 1, 1);
    }

    function latestRoundData()
        external
        view
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (1, price, 1, 1, 1);
    }
}
