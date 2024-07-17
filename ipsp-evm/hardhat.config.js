require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("solidity-coverage");
require("solidity-docgen");

require("@openzeppelin/hardhat-upgrades");
require("@openzeppelin/hardhat-defender");

task("newKey", "Creates a private key and prints the address").setAction(
  async (args, hre) => {
    const wallet = hre.ethers.Wallet.createRandom();
    console.log("Private key:", wallet.privateKey);
    console.log("Address:", wallet.address);
    console.log("Public key:", wallet.publicKey);
  }
);

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
        details: {
          yul: true,
        },
      },
    },
  },
  networks: {
    polygon: {
      url: process.env.POLYGON_URL || "",
      accounts: process.env.PROD_PRIVATE_KEY
        ? [process.env.PROD_PRIVATE_KEY]
        : [],
      
      IWATT_contract: "0xe71f80fB7BafDcDBA20E89E2dC9356CB86E502BD",
      PAWATT_contract: "0x7EC2d2aa04A8FCB3e1837273C1199b7017757074",

      CWATT_contract: "0xA97F060E6211DF0963DaA19837FDc52c858488BF",
      DWATT_contract: "0x97f700CC431d05f9Bb544D7ac6c7b91fb1cE0e3E",
      EWATT_contract: "0x616eA6D7B5a1621b70437d0e2284c0BeDBB019D3",

      PWATT_contract: "0x875Ef9a6f3658A24446b1d1bC6a3c6A50CFb24Ba",
      NWATT_contract: "0xfbb2DFEaF855d71104E83d8b39f9E2820A568b2c",
      XWATT_contract: "0x34BCA9A65b0A687a3802a923f8e093666FfCe3a0",
      LWATT_contract: "0x8a31BED09c8873d2C77B46C7FC25c13C8A2bD5bC",
      POWATT_contract: "0x05E15237C021EE379b0513850447547538Fc699e",
    },
    "base-mainnet": {
      url: process.env.BASE_URL || "",
      accounts: process.env.PROD_PRIVATE_KEY
        ? [process.env.PROD_PRIVATE_KEY]
        : [],

      IWATT_contract: "0xF19579bf280389618F6092034C052F2bF96FfD24",
      PAWATT_contract: "0x7EC2d2aa04A8FCB3e1837273C1199b7017757074",

      CWATT_contract: "0x42968391b17Ce030c40F8D5B2e81f12189185f03",
      DWATT_contract: "0xA97F060E6211DF0963DaA19837FDc52c858488BF",
      EWATT_contract: "0x97f700CC431d05f9Bb544D7ac6c7b91fb1cE0e3E",

      PWATT_contract: "0x616eA6D7B5a1621b70437d0e2284c0BeDBB019D3",
      NWATT_contract: "0x875Ef9a6f3658A24446b1d1bC6a3c6A50CFb24Ba",
      XWATT_contract: "0xfbb2DFEaF855d71104E83d8b39f9E2820A568b2c",
      LWATT_contract: "0x34BCA9A65b0A687a3802a923f8e093666FfCe3a0",
      POWATT_contract: "0x8a31BED09c8873d2C77B46C7FC25c13C8A2bD5bC",
    },
    optimism: {
      url: process.env.OPTIMISM_URL || "",
      accounts: process.env.PROD_PRIVATE_KEY
        ? [process.env.PROD_PRIVATE_KEY]
        : [],

      IWATT_contract: "0xF19579bf280389618F6092034C052F2bF96FfD24",
      PAWATT_contract: "0xABB26cD2d95Aea0d3EA247eedc9Ca17830fD252C",

      CWATT_contract: "0x7726FF2842315E8D677d49Fcad371ce416381311",
      DWATT_contract: "0xe71f80fB7BafDcDBA20E89E2dC9356CB86E502BD",
      EWATT_contract: "0x7EC2d2aa04A8FCB3e1837273C1199b7017757074",

      PWATT_contract: "0x42968391b17Ce030c40F8D5B2e81f12189185f03",
      NWATT_contract: "0xA97F060E6211DF0963DaA19837FDc52c858488BF",
      XWATT_contract: "0x97f700CC431d05f9Bb544D7ac6c7b91fb1cE0e3E",
      LWATT_contract: "0x616eA6D7B5a1621b70437d0e2284c0BeDBB019D3",
      POWATT_contract: "0x875Ef9a6f3658A24446b1d1bC6a3c6A50CFb24Ba",
    },
    mumbai: {
      url: process.env.MUMBAI_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      contract: "0x34F6bC43067414A2d78df5B8db14B4687ed3E3D4",
      externalScorerContract: "0x220284101048fBA2eacAFcCE998Ea0b78a7E2828",
      powerUpScorerContract: "0x6fCaA85b52E9D3848ebbca3E4D65D5bf7C48D34F",
      sparksContract: "0xD63BfA90373945444C4CCc8Aec0A23cFfdFF3bC1",
      inviteLinksContract: "0x873583F82A0860fe49fD787a1F08c81664208A10",
      profileContract: "0x505225c5D069c407BEA65EE09875Dbf05B629f0f",
      wethContract: "0xe097d6b3100777dc31b34dc2c58fb524c2e76921",
      salesRecipient: "0x9d2522Fc8886809aa4Ae39998E3C1Ffe45A0226A",
      externalBadgeSignerAddress: "0x2C6D9025d4454aC867FB3394aC4531ce8Caf419B",
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    coinmarketcap: process.env.COIN_MARKETCAP_KEY,
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      rinkeby: process.env.ETHERSCAN_API_KEY,
      goerli: process.env.ETHERSCAN_API_KEY,
      ropsten: process.env.ETHERSCAN_API_KEY,
      polygon: process.env.POLYSCAN_API_KEY,
      polygonMumbai: process.env.POLYSCAN_API_KEY,
    },
  },
  docgen: {
    path: "./docs",
    clear: true,
    runOnCompile: false,
    excludedContracts: ["./mocks"],
  },
};
