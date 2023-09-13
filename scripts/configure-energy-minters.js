const { ethers, network } = require("hardhat");
const {
  CWATT,
  XWATT,
  PWATT,
  NWATT,
  VWATT,
  LWATT,
  SWATT,
} = require("../test/test-utils");

async function main() {
  const { config } = network;
  const contractAddress = config.contract;

  if (!contractAddress) {
    throw new Error("No contract address found");
  }

  const contract = await ethers.getContractAt("SafeEnergy", contractAddress);
  const minters = {
    [config.powerUpScorerContract]: [XWATT, PWATT, LWATT],
    [config.externalScorerContract]: [CWATT, NWATT, VWATT],
    [config.sparksContract]: [CWATT],
  };

  for (const [scorer, tokens] of Object.entries(minters)) {
    for (const token of tokens) {
      const isTokenMinter = await contract.tokenMinters(token, scorer);
      if (!isTokenMinter) {
        const tx = await contract.addTokenMinter(token, scorer);
        await tx.wait();
        console.log(`Token ${token} minter added for ${scorer}`);
      } else {
        console.log(`Token ${token} already minter for ${scorer}`);
      }
    }
  }

  const tokenMultipliers = {
    [XWATT]: 100,
    [PWATT]: 100,
    [CWATT]: 100,
    [NWATT]: 100,
    [VWATT]: 100,
    [LWATT]: 100,
    [SWATT]: 100,
  };

  for (const [token, multiplier] of Object.entries(tokenMultipliers)) {
    const currentMultiplier = await contract.tokenMultipliers(token);
    if (currentMultiplier !== multiplier) {
      const tx = await contract.setTokenMultiplier(token, multiplier);
      await tx.wait();
      console.log(`Token ${token} multiplier set to ${multiplier}`);
    } else {
      console.log(`Token ${token} multiplier already set to ${multiplier}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
