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
      contract: "0x935e8F7EAce4DD560b2A32918A148A4F5218016c",
      externalScorerContract: "0xcAe74F105A2d1FE0cdE72A48648ad6d4185Dd10f",
      powerUpScorerContract: "0xb081cB4127bA08C7493Ba8e34A4f6292d0c27E89",
      sparksContract: "0x5e01157f65E225b68b2FdBce40D9E7020a978Fc2",
      inviteLinksContract: "0x93Fa3D0d567fEb7b6EeF9323Ed6399ce53f981ba",
      profileContract: "0xe9fE474d829F55C3eaf23fFbAE454c8375C51551",
      wethContract: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      salesRecipient: "0x919a9DD276D09F089425a16Df5cf399eb0d47E4e",
      externalBadgeSignerAddress: "0x9E8F10d3787FD1cA6340b70d6Fa04558DE13B284",
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
