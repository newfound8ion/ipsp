const { ethers, network } = require("hardhat");

async function main() {
  const { config } = network;
  const contractAddress = config.profileContract;
  const signerAddress = config.externalBadgeSignerAddress;

  if (!contractAddress) {
    throw new Error("No contract address found");
  }

  if (!signerAddress) {
    throw new Error("No signer address found");
  }

  const contract = await ethers.getContractAt("Profile", contractAddress);

  // Add Signers
  const isSignerAdded = await contract.authorizedSigners(signerAddress);

  if (!isSignerAdded) {
    const tx = await contract.addAuthorizedSigner(signerAddress);
    await tx.wait();
    console.log(`Signer ${signerAddress} added`);
  } else {
    console.log(`Signer ${signerAddress} already added`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
