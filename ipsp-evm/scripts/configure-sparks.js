const { parseEther } = require("ethers/lib/utils");
const { ethers, network } = require("hardhat");

// Deploy the external scorer contract or upgrade it if it already exists
async function main() {
  const { config } = network;
  const contractAddress = config.sparksContract;
  const safeEnergyContract = config.contract;
  const wethContract = config.wethContract;
  const salesRecipient = config.salesRecipient;
  const inviteLinksContract = config.inviteLinksContract;
  const signer = await ethers.getSigner();
  const deployer = signer.address;

  if (!safeEnergyContract || !wethContract || !salesRecipient) {
    console.log("Safe energy contract", safeEnergyContract);
    console.log("WETH contract", wethContract);
    console.log("Sales recipient", salesRecipient);
    throw new Error("Invalid config: missing contract addresses");
  }

  const priceInWei = parseEther("0.1");
  const uri = "ipfs://QmdJhu6wpH4xGyTaH3prUN4EQJ3vtuNZ1f2cVtivUiVQqK";
  const energyPerSpark = parseEther("10");
  const contractURI = "ipfs://QmTPTb4DUSynangoGqD6h6sMAtbj81X3LSwhcgzjdvH44S";

  const contract = await ethers.getContractAt("Sparks", contractAddress);

  const [
    currentPrice,
    currentCurrency,
    currentEnergyPerSpark,
    currentUri,
    currentSalesRecipient,
    currentContractURI,
  ] = await Promise.all([
    contract.tokenPriceInCurrency(),
    contract.currency(),
    contract.energyPerSpark(),
    contract.uri(0),
    contract.salesRecipient(),
    contract.contractURI(),
  ]);

  if (!currentPrice.eq(priceInWei) || currentCurrency !== wethContract) {
    const tx = await contract.updateTokenPrice(wethContract, priceInWei);
    await tx.wait();
    console.log("Updated token price to", priceInWei, wethContract);
  } else {
    console.log("Token price is already correct");
  }

  if (!currentEnergyPerSpark.eq(energyPerSpark)) {
    const tx = await contract.updateEnergyPerSpark(energyPerSpark);
    await tx.wait();
    console.log("Updated energy per spark to", energyPerSpark);
  } else {
    console.log("Energy per spark is already correct");
  }

  if (currentUri !== uri) {
    const tx = await contract.updateUri(uri);
    await tx.wait();
    console.log("Updated uri to", uri);
  } else {
    console.log("Uri is already correct");
  }

  if (currentSalesRecipient.toLowerCase() !== salesRecipient.toLowerCase()) {
    const tx = await contract.updateSalesRecipient(salesRecipient);
    await tx.wait();
    console.log("Updated sales recipient to", salesRecipient);
  } else {
    console.log("Sales recipient is already correct");
  }

  if (currentContractURI !== contractURI) {
    const tx = await contract.updateContractURI(contractURI);
    await tx.wait();
    console.log("Updated contract URI to", contractURI);
  } else {
    console.log("Contract URI is already correct");
  }

  const isMinter = await contract.tokenMinters(inviteLinksContract);
  if (!isMinter) {
    const tx = await contract.addTokenMinter(inviteLinksContract);
    await tx.wait();
    console.log("Added invite links contract as minter");
  } else {
    console.log("Invite links contract is already minter");
  }

  const isDeployerAdded = await contract.tokenMinters(deployer);
  if (!isDeployerAdded) {
    const tx = await contract.addTokenMinter(deployer);
    await tx.wait();
    console.log("Added deployer as minter");
  } else {
    console.log("Deployer is already minter");
  }

  const tokenMinters = ["0xd571f2da2e240a78f761eddc21ca95d438da1035"];
  for (const tokenMinter of tokenMinters) {
    const isMinter = await contract.tokenMinters(tokenMinter);
    if (!isMinter) {
      const tx = await contract.addTokenMinter(tokenMinter);
      await tx.wait();
      console.log("Added token minter", tokenMinter);
    } else {
      console.log("Token minter", tokenMinter, "already added");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
