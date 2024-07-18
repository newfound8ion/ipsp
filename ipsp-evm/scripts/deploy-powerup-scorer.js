const { ethers, upgrades, network } = require("hardhat");

// Deploy the external scorer contract or upgrade it if it already exists
async function main() {
  const Contract = await ethers.getContractFactory("PowerUpScorer");
  const { config } = network;
  const contractAddress = config.powerUpScorerContract;
  const safeEnergyContract = config.contract;

  if (!safeEnergyContract) {
    throw new Error("No SafeEnergy contract address found");
  }

  if (!contractAddress) {
    const contract = await upgrades.deployProxy(Contract, [safeEnergyContract]);
    await contract.deployed();
    console.log("Contract deployed to:", contract.address);
  } else {
    const contract = await upgrades.upgradeProxy(contractAddress, Contract);
    console.log("Contract upgraded:", contract.address);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
