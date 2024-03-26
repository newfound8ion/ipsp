const { ethers, upgrades, network } = require("hardhat");

async function main() {
  const Contract = await ethers.getContractFactory("ImmutablePointsBase");
  const { config } = network;
  const contractAddress = config.contract;

  const numberOfContracts = 10;

  for(let i = 0; i < numberOfContracts; i++ ) {
    const contract = await upgrades.deployProxy(Contract, []);
    await contract.deployed();
    console.log("Contract deployed to:", contract.address);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
