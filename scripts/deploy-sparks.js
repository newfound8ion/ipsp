const { ethers, upgrades, network } = require("hardhat");

// Deploy the external scorer contract or upgrade it if it already exists
async function main() {
  const Contract = await ethers.getContractFactory("Sparks");
  const { config } = network;
  const contractAddress = config.sparksContract;
  const safeEnergyContract = config.contract;
  const wethContract = config.wethContract;
  const salesRecipient = config.salesRecipient;

  if (!safeEnergyContract || !wethContract || !salesRecipient) {
    console.log("Safe energy contract", safeEnergyContract);
    console.log("WETH contract", wethContract);
    console.log("Sales recipient", salesRecipient);
    throw new Error("Invalid config: missing contract addresses");
  }

  const initArgs = [
    "ipfs://QmdJhu6wpH4xGyTaH3prUN4EQJ3vtuNZ1f2cVtivUiVQqK",
    safeEnergyContract,
    wethContract,
    salesRecipient,
  ];

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
