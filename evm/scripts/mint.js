const { BigNumber } = require("ethers");
const { network, ethers } = require("hardhat");

async function main() {
  const contractAddress = network.config.contract;
  if (!contractAddress) {
    throw new Error("No contract address found");
  }

  const contract = await ethers.getContractAt("SafeEnergy", contractAddress);

  const recipient = "";
  const mint = [
    { id: 1, amount: 1 },
    { id: 2, amount: 2 },
    { id: 3, amount: 3 },
    { id: 4, amount: 4 },
    { id: 5, amount: 5 },
    { id: 6, amount: 6 },
    { id: 7, amount: 7 },
  ];

  for (let i = 0; i < mint.length; i++) {
    const { id, amount } = mint[i];
    const tx = await contract.mint(
      recipient,
      id,
      BigNumber.from(amount).mul(BigNumber.from(10).pow(18))
    );
    await tx.wait(1);
    console.log(`Mint successful. Hash: `, tx.hash);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
