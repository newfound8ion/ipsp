const { ethers, network } = require("hardhat");

async function main() {
  const { config } = network;
  const safeEnergyContractAddress = config.contract;
  const sparksContractAddress = config.sparksContract;
  const linksContractAddress = config.inviteLinksContract;

  if (!sparksContractAddress) {
    throw new Error("No sparks contract address found");
  }

  if (!linksContractAddress) {
    throw new Error("No links contract address found");
  }

  if (!safeEnergyContractAddress) {
    throw new Error("No safe energy contract address found");
  }

  const inviteLinksContract = await ethers.getContractAt(
    "InviteLinks",
    linksContractAddress
  );

  const sparksContract = await ethers.getContractAt(
    "Sparks",
    sparksContractAddress
  );

  const safeEnergyContract = await ethers.getContractAt(
    "SafeEnergy",
    safeEnergyContractAddress
  );

  const isMinter = await sparksContract.tokenMinters(linksContractAddress);
  if (!isMinter) {
    const tx = await sparksContract.addTokenMinter(linksContractAddress);
    await tx.wait();
    console.log(`Token minter ${linksContractAddress} added for sparks`);
  } else {
    console.log(
      `Token minter ${linksContractAddress} already added for sparks`
    );
  }

  const isLinkAdmin = await inviteLinksContract.linkAdmins(
    sparksContractAddress
  );
  if (!isLinkAdmin) {
    const tx = await inviteLinksContract.addLinkAdmin(sparksContractAddress);
    await tx.wait();
    console.log(`Link admin ${sparksContractAddress} added for invite links`);
  } else {
    console.log(
      `Link admin ${sparksContractAddress} already added for invite links`
    );
  }

  const currentLinkCreator = await sparksContract.linkCreator();
  if (currentLinkCreator !== linksContractAddress) {
    const tx = await sparksContract.setLinkCreator(linksContractAddress);
    await tx.wait();
    console.log(`Link creator ${linksContractAddress} set for sparks`);
  } else {
    console.log(`Link creator ${linksContractAddress} already set for sparks`);
  }

  const currentMilestoneAwarder = await safeEnergyContract.milestoneAwarder();
  if (currentMilestoneAwarder !== linksContractAddress) {
    const tx = await safeEnergyContract.setMilestoneAwarder(
      linksContractAddress
    );
    await tx.wait();
    console.log(
      `Milestone awarder ${linksContractAddress} set for safe energy`
    );
  } else {
    console.log(
      `Milestone awarder ${linksContractAddress} already set for safe energy`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
