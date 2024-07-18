const { ethers, upgrades, network } = require("hardhat");

// Deploy the external scorer contract or upgrade it if it already exists
async function main() {
  const Contract = await ethers.getContractFactory("Profile");
  const { config } = network;
  const contractAddress = config.profileContract;

  if (!contractAddress) {
    const contract = await upgrades.deployProxy(Contract, []);
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
