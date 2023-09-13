const { ethers, upgrades, network } = require("hardhat");

// Deploy the external scorer contract or upgrade it if it already exists
async function main() {
  const Contract = await ethers.getContractFactory("InviteLinks");
  const { config } = network;
  const contractAddress = config.inviteLinksContract;
  const safeEnergyContract = config.contract;
  const sparksContract = config.sparksContract;

  if (!safeEnergyContract || !sparksContract) {
    console.log("Safe energy contract", safeEnergyContract);
    console.log("Sparks contract", sparksContract);
    throw new Error("Invalid config: missing contract addresses");
  }

  const initArgs = [safeEnergyContract, sparksContract];

  if (!contractAddress) {
    const contract = await upgrades.deployProxy(Contract, initArgs);
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
